package com.cyber.tv.launcher;

import android.app.Activity;
import android.content.Context;
import android.media.AudioManager;
import android.os.Build;
import android.util.Log;
import android.view.KeyEvent;
import android.webkit.WebView;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.Map;

public class TVHttpServer {
    private static final String TAG = "TVHttpServer";
    private final Activity activity;
    private final WebView webView;
    private final int port;
    private ServerSocket serverSocket;
    private volatile boolean isRunning = false;
    private Thread serverThread;

    public TVHttpServer(Activity activity, WebView webView, int port) {
        this.activity = activity;
        this.webView = webView;
        this.port = port;
    }

    public synchronized void start() {
        if (isRunning) return;
        isRunning = true;
        serverThread = new Thread(() -> {
            try {
                serverSocket = new ServerSocket(port);
                Log.i(TAG, "TVHttpServer listening on port " + port);
                while (isRunning && !serverSocket.isClosed()) {
                    try {
                        Socket client = serverSocket.accept();
                        handleClient(client);
                    } catch (Exception e) {
                        if (!isRunning) break;
                    }
                }
            } catch (Exception e) {
                Log.e(TAG, "Error in TVHttpServer: " + e.getMessage());
            }
        });
        serverThread.setDaemon(true);
        serverThread.start();
    }

    public synchronized void stop() {
        isRunning = false;
        try {
            if (serverSocket != null) serverSocket.close();
        } catch (Exception ignored) {}
    }

    private void handleClient(Socket socket) {
        new Thread(() -> {
            try {
                BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream()));
                String line = reader.readLine();
                if (line == null) {
                    socket.close();
                    return;
                }

                String[] parts = line.split(" ");
                if (parts.length < 2) {
                    socket.close();
                    return;
                }

                String method = parts[0];
                String pathWithQuery = parts[1];
                String path = pathWithQuery;
                Map<String, String> query = new HashMap<>();

                int qIdx = pathWithQuery.indexOf('?');
                if (qIdx != -1) {
                    path = pathWithQuery.substring(0, qIdx);
                    String qStr = pathWithQuery.substring(qIdx + 1);
                    for (String pair : qStr.split("&")) {
                        String[] kv = pair.split("=");
                        if (kv.length == 2) {
                            query.put(URLDecoder.decode(kv[0], "UTF-8"), URLDecoder.decode(kv[1], "UTF-8"));
                        }
                    }
                }

                String jsonResponse = "{}";
                int statusCode = 200;

                if ("/api/status".equals(path)) {
                    JSONObject status = new JSONObject();
                    status.put("connected", true);
                    status.put("deviceName", Build.MODEL != null && !Build.MODEL.isEmpty() ? "Xiaomi " + Build.MODEL : "Xiaomi MiTV-MOOR2");
                    status.put("port", port);
                    status.put("version", "4.0.2");
                    status.put("themeCount", 11);

                    AndroidBridge bridge = new AndroidBridge(activity);
                    status.put("currentTheme", bridge.getSavedTheme());
                    status.put("currentStyle", bridge.getSavedStyle());
                    status.put("bgEffects", bridge.getSavedBgEffects());
                    status.put("deviceUID", LicenseManager.getDeviceUID(activity));
                    status.put("isPremium", LicenseManager.isPremiumActive(activity));
                    status.put("amountVnd", LicenseManager.AMOUNT_VND);
                    status.put("accountNumber", LicenseManager.ACCOUNT_NUMBER);

                    try {
                        JSONObject ram = new JSONObject(bridge.getRamInfo());
                        status.put("availMb", ram.optInt("availMb", 850));
                        status.put("totalMb", ram.optInt("totalMb", 1800));
                    } catch (Exception ignored) {}

                    jsonResponse = status.toString();

                } else if ("/api/license".equals(path)) {
                    jsonResponse = LicenseManager.getLicenseDetails(activity).toString();

                } else if ("/api/activate".equals(path)) {
                    String key = query.get("key");
                    boolean ok = LicenseManager.activate(activity, key);
                    if (ok && webView != null) {
                        activity.runOnUiThread(() -> webView.evaluateJavascript("if (window.onLicenseActivated) window.onLicenseActivated();", null));
                    }
                    JSONObject res = new JSONObject();
                    res.put("success", ok);
                    res.put("isPremium", LicenseManager.isPremiumActive(activity));
                    jsonResponse = res.toString();

                } else if ("/api/theme".equals(path)) {
                    AndroidBridge bridge = new AndroidBridge(activity);
                    String rawId = query.get("id");
                    String rawStyle = query.get("style");
                    String rawBg = query.get("bgEffects");

                    String resolvedThemeId = bridge.getSavedTheme();
                    String resolvedStyle = bridge.getSavedStyle();

                    if (rawId != null && !rawId.isEmpty()) {
                        String cleanId = rawId.trim().toLowerCase();
                        if ("minimal".equals(cleanId)) {
                            resolvedThemeId = "cybertv-classic";
                            resolvedStyle = "minimal";
                        } else if ("cinema".equals(cleanId) || "gold".equals(cleanId)) {
                            resolvedThemeId = "cybertv-classic";
                            resolvedStyle = "gold";
                        } else if ("cyber".equals(cleanId) || "neon".equals(cleanId) || "cybertv".equals(cleanId) || "cybertv-classic".equals(cleanId)) {
                            resolvedThemeId = "cybertv-classic";
                        } else if ("cinema-horizon".equals(cleanId) || "orbit-os".equals(cleanId)
                                || "zen-gallery".equals(cleanId) || "nexus-command".equals(cleanId)
                                || "prism-float".equals(cleanId) || "edition-noir".equals(cleanId)
                                || "sonata-lounge".equals(cleanId)) {
                            resolvedThemeId = cleanId;
                        }
                    }

                    if (rawStyle != null && !rawStyle.isEmpty()) {
                        String s = rawStyle.trim().toLowerCase();
                        if ("minimal".equals(s)) resolvedStyle = "minimal";
                        else if ("gold".equals(s) || "cinema".equals(s)) resolvedStyle = "gold";
                        else resolvedStyle = "neon";
                    }

                    final String finalThemeId = resolvedThemeId;
                    final String finalStyle = resolvedStyle;

                    boolean resolvedBg = bridge.getSavedBgEffects();
                    if (rawBg != null && !rawBg.isEmpty()) {
                        resolvedBg = "true".equalsIgnoreCase(rawBg) || "1".equals(rawBg);
                    }
                    final boolean finalBgEffects = resolvedBg;

                    bridge.saveThemeConfig(finalThemeId, finalStyle, finalBgEffects);

                    activity.runOnUiThread(() -> {
                        webView.evaluateJavascript(
                            "if (typeof applyFullThemeState === 'function') { applyFullThemeState('" + finalThemeId + "', '" + finalStyle + "', " + finalBgEffects + ", true, true); } else if (typeof applyThemeConfig === 'function') { applyThemeConfig('" + finalStyle + "', " + finalBgEffects + ", true, true); }",
                            null
                        );
                    });

                    JSONObject res = new JSONObject();
                    res.put("success", true);
                    res.put("themeId", finalThemeId);
                    res.put("style", finalStyle);
                    res.put("bgEffects", finalBgEffects);
                    jsonResponse = res.toString();

                } else if ("/api/key".equals(path)) {
                    String codeStr = query.get("code");
                    if (codeStr != null) {
                        try {
                            final int keyCode = Integer.parseInt(codeStr);
                            activity.runOnUiThread(() -> {
                                handleSystemOrWebKey(keyCode);
                            });
                            JSONObject res = new JSONObject();
                            res.put("success", true);
                            res.put("keyCode", keyCode);
                            jsonResponse = res.toString();
                        } catch (Exception ignored) {}
                    }

                } else if ("/api/channel".equals(path)) {
                    String numStr = query.get("num");
                    if (numStr != null) {
                        try {
                            final int num = Integer.parseInt(numStr);
                            activity.runOnUiThread(() -> {
                                webView.evaluateJavascript("if (typeof directJumpToChannel === 'function') directJumpToChannel(" + num + ");", null);
                            });
                            JSONObject res = new JSONObject();
                            res.put("success", true);
                            res.put("channelNum", num);
                            jsonResponse = res.toString();
                        } catch (Exception ignored) {}
                    }

                } else if ("/api/boost".equals(path)) {
                    activity.runOnUiThread(() -> {
                        AndroidBridge bridge = new AndroidBridge(activity);
                        bridge.cleanRAM();
                    });
                    JSONObject res = new JSONObject();
                    res.put("success", true);
                    res.put("message", "Đã giải phóng RAM trên TV");
                    jsonResponse = res.toString();

                } else if ("/api/modal".equals(path) || "/api/action".equals(path)) {
                    String name = query.get("name");
                    if ("store".equals(name) || "themes".equals(name) || "themestore".equals(name)) {
                        activity.runOnUiThread(() -> webView.evaluateJavascript("if (typeof openThemeStoreModal === 'function') openThemeStoreModal();", null));
                        JSONObject res = new JSONObject();
                        res.put("success", true);
                        res.put("modal", "theme-store");
                        jsonResponse = res.toString();
                    } else if ("close".equals(name)) {
                        activity.runOnUiThread(() -> webView.evaluateJavascript("if (typeof closeThemeStoreModal === 'function') closeThemeStoreModal();", null));
                        JSONObject res = new JSONObject();
                        res.put("success", true);
                        res.put("modal", "closed");
                        jsonResponse = res.toString();
                    } else if ("channels".equals(name)) {
                        activity.runOnUiThread(() -> webView.evaluateJavascript("if (typeof openChannelBrowserModal === 'function') openChannelBrowserModal('all');", null));
                        JSONObject res = new JSONObject();
                        res.put("success", true);
                        res.put("modal", "channels");
                        jsonResponse = res.toString();
                    } else if ("apps".equals(name)) {
                        activity.runOnUiThread(() -> webView.evaluateJavascript("if (typeof openChannelBrowserModal === 'function') openChannelBrowserModal('apps');", null));
                        JSONObject res = new JSONObject();
                        res.put("success", true);
                        res.put("modal", "apps");
                        jsonResponse = res.toString();
                    }
                } else if ("/api/lock".equals(path)) {
                    String action = query.get("action");
                    final boolean isLock = !"unlock".equalsIgnoreCase(action);
                    activity.runOnUiThread(() -> {
                        if (isLock) {
                            webView.evaluateJavascript("if (typeof showPaywall === 'function') { showPaywall('hard_lock_expired'); }", null);
                        } else {
                            webView.evaluateJavascript("if (typeof onLicenseActivated === 'function') { onLicenseActivated(); }", null);
                        }
                    });
                    JSONObject res = new JSONObject();
                    res.put("success", true);
                    res.put("locked", isLock);
                    res.put("message", isLock ? "Đã khóa TV từ xa theo lệnh của Admin" : "Đã mở khóa TV từ xa");
                    jsonResponse = res.toString();
                } else if ("/api/broadcast".equals(path)) {
                    String text = query.get("text");
                    if (text == null || text.isEmpty()) {
                        text = "🎉 CyberTV Đạt Mốc 50 Thiết Bị Premium! Tri ân toàn bộ người dùng 48 giờ miễn phí!";
                    }
                    final String alertMsg = text;
                    activity.runOnUiThread(() -> {
                        webView.evaluateJavascript("if (typeof showEngineToast === 'function') { showEngineToast('THÔNG BÁO TỪ ADMIN', '" + alertMsg.replace("'", "\\'") + "'); } else { alert('" + alertMsg.replace("'", "\\'") + "'); }", null);
                    });
                    JSONObject res = new JSONObject();
                    res.put("success", true);
                    res.put("broadcast", alertMsg);
                    jsonResponse = res.toString();

                } else if ("/admin".equals(path) || "/admin/index.html".equals(path)) {
                    String uid = LicenseManager.getDeviceUID(activity);
                    boolean isPrem = LicenseManager.isPremiumActive(activity);
                    String html = "<!DOCTYPE html><html lang='vi'><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1.0'><title>CyberTV Admin Hub</title><style>" +
                        "body{background:#070b14;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:20px;}" +
                        ".card{background:rgba(255,255,255,0.05);border:1px solid rgba(0,242,254,0.25);border-radius:16px;padding:18px;margin-bottom:16px;box-shadow:0 8px 32px rgba(0,0,0,0.4);}" +
                        ".badge{background:linear-gradient(135deg,#00f2fe,#4facfe);color:#000;padding:3px 8px;border-radius:6px;font-size:11px;font-weight:900;}" +
                        ".gold{color:#ffd700;}.green{color:#10b981;}.cyan{color:#00f2fe;}" +
                        "button{width:100%;padding:12px;border:none;border-radius:12px;font-weight:bold;font-size:14px;cursor:pointer;margin-top:8px;}" +
                        ".btn-pri{background:linear-gradient(90deg,#00f2fe,#0072ff);color:#000;}" +
                        ".btn-gold{background:linear-gradient(90deg,#ffd700,#ff8c00);color:#000;}" +
                        "</style></head><body>" +
                        "<h2>👑 CyberTV Admin Control Center</h2>" +
                        "<div class='card'>" +
                        "<div><b>Thiết Bị:</b> <span class='cyan'>" + (Build.MODEL != null ? Build.MODEL : "Android TV") + "</span></div>" +
                        "<div style='margin-top:6px;'><b>Device UID:</b> <span class='cyan'>" + uid + "</span></div>" +
                        "<div style='margin-top:6px;'><b>Bản Quyền:</b> " + (isPrem ? "<span class='green'>✓ ĐÃ MUA PREMIUM (79K)</span>" : "<span class='gold'>⏳ CHỜ KÍCH HOẠT</span>") + "</div>" +
                        "<div style='margin-top:6px;'><b>Tài Khoản MBBank:</b> <span class='gold'>1010157820008 (TRAN QUOC HUY)</span></div>" +
                        "</div>" +
                        "<div class='card'>" +
                        "<div class='gold'><b>🏆 Cột Mốc 50 Thiết Bị Premium</b></div>" +
                        "<p style='font-size:12px;opacity:0.8;'>Gửi thông báo tặng 48 giờ miễn phí toàn bộ Theme cao cấp và Kênh VIP tới màn hình TV.</p>" +
                        "<button class='btn-gold' onclick=\"fetch('/api/broadcast').then(()=>alert('Đã gửi thông báo chúc mừng tới TV!'))\">📢 Phát Sóng Thông Báo 50 Lượt Miễn Phí</button>" +
                        "</div>" +
                        "<div class='card'>" +
                        "<button class='btn-pri' onclick=\"fetch('/api/boost').then(()=>alert('Đã giải phóng RAM TV'))\">⚡ Tối Ưu & Dọn Dẹp RAM TV</button>" +
                        "</div>" +
                        "</body></html>";

                    byte[] bodyBytes = html.getBytes("UTF-8");
                    OutputStream out = socket.getOutputStream();
                    String header = "HTTP/1.1 200 OK\r\n" +
                            "Content-Type: text/html; charset=utf-8\r\n" +
                            "Content-Length: " + bodyBytes.length + "\r\n" +
                            "Access-Control-Allow-Origin: *\r\n" +
                            "Connection: close\r\n\r\n";
                    out.write(header.getBytes("UTF-8"));
                    out.write(bodyBytes);
                    out.flush();
                    socket.close();
                    return;

                } else if ("/api/eval".equals(path)) {
                    String js = query.get("js");
                    if (js != null) {
                        activity.runOnUiThread(() -> webView.evaluateJavascript(js, null));
                        JSONObject res = new JSONObject();
                        res.put("success", true);
                        jsonResponse = res.toString();
                    }
                } else {
                    statusCode = 404;
                    jsonResponse = "{\"error\": \"Not Found\"}";
                }

                byte[] bodyBytes = jsonResponse.getBytes("UTF-8");
                OutputStream out = socket.getOutputStream();
                String header = "HTTP/1.1 " + statusCode + " OK\r\n" +
                        "Content-Type: application/json; charset=utf-8\r\n" +
                        "Content-Length: " + bodyBytes.length + "\r\n" +
                        "Access-Control-Allow-Origin: *\r\n" +
                        "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n" +
                        "Connection: close\r\n\r\n";
                out.write(header.getBytes("UTF-8"));
                out.write(bodyBytes);
                out.flush();
                socket.close();

            } catch (Exception ignored) {
                try {
                    socket.close();
                } catch (Exception e2) {}
            }
        }).start();
    }

    private void handleSystemOrWebKey(int keyCode) {
        Log.i(TAG, "Processing remote key: " + keyCode);

        // 1. Audio / Volume controls
        if (keyCode == 24) { // KEYCODE_VOLUME_UP
            try {
                AudioManager am = (AudioManager) activity.getSystemService(Context.AUDIO_SERVICE);
                if (am != null) {
                    am.adjustStreamVolume(AudioManager.STREAM_MUSIC, AudioManager.ADJUST_RAISE, AudioManager.FLAG_SHOW_UI);
                }
            } catch (Exception e) {
                Log.e(TAG, "Failed volume up", e);
            }
            webView.evaluateJavascript("if (typeof showVolumeHud === 'function') showVolumeHud('up'); else if (typeof handleKey === 'function') handleKey(24);", null);
            return;
        }

        if (keyCode == 25) { // KEYCODE_VOLUME_DOWN
            try {
                AudioManager am = (AudioManager) activity.getSystemService(Context.AUDIO_SERVICE);
                if (am != null) {
                    am.adjustStreamVolume(AudioManager.STREAM_MUSIC, AudioManager.ADJUST_LOWER, AudioManager.FLAG_SHOW_UI);
                }
            } catch (Exception e) {
                Log.e(TAG, "Failed volume down", e);
            }
            webView.evaluateJavascript("if (typeof showVolumeHud === 'function') showVolumeHud('down'); else if (typeof handleKey === 'function') handleKey(25);", null);
            return;
        }

        if (keyCode == 164) { // KEYCODE_VOLUME_MUTE
            try {
                AudioManager am = (AudioManager) activity.getSystemService(Context.AUDIO_SERVICE);
                if (am != null) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        am.adjustStreamVolume(AudioManager.STREAM_MUSIC, AudioManager.ADJUST_TOGGLE_MUTE, AudioManager.FLAG_SHOW_UI);
                    } else {
                        boolean isMuted = am.getStreamVolume(AudioManager.STREAM_MUSIC) == 0;
                        am.setStreamMute(AudioManager.STREAM_MUSIC, !isMuted);
                    }
                }
            } catch (Exception e) {
                Log.e(TAG, "Failed volume mute", e);
            }
            webView.evaluateJavascript("if (typeof showVolumeHud === 'function') showVolumeHud('mute'); else if (typeof handleKey === 'function') handleKey(164);", null);
            return;
        }

        // 2. Power / Screen Off / Standby (KeyCode 26)
        if (keyCode == 26) { // KEYCODE_POWER
            try {
                Runtime.getRuntime().exec("input keyevent 26");
            } catch (Exception e) {
                Log.e(TAG, "Failed exec input keyevent 26", e);
            }
            try {
                activity.dispatchKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN, KeyEvent.KEYCODE_POWER));
                activity.dispatchKeyEvent(new KeyEvent(KeyEvent.ACTION_UP, KeyEvent.KEYCODE_POWER));
            } catch (Exception ignored) {}
            webView.evaluateJavascript("if (typeof showPowerDialog === 'function') showPowerDialog(); else if (typeof handleKey === 'function') handleKey(26);", null);
            return;
        }

        // 2.5. Home Key (KeyCode 3) -> Bring CyberTV Launcher to foreground immediately
        if (keyCode == 3) { // KEYCODE_HOME
            try {
                android.content.Intent homeIntent = new android.content.Intent(activity, MainActivity.class);
                homeIntent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK | android.content.Intent.FLAG_ACTIVITY_REORDER_TO_FRONT | android.content.Intent.FLAG_ACTIVITY_SINGLE_TOP);
                activity.startActivity(homeIntent);
            } catch (Exception e) {
                Log.e(TAG, "Failed to bring MainActivity to front", e);
            }
            webView.evaluateJavascript("if (typeof handleKey === 'function') handleKey(3);", null);
            return;
        }

        // 3. Dispatch to Web UI & System
        webView.evaluateJavascript("if (typeof handleKey === 'function') handleKey(" + keyCode + ");", null);
        if (keyCode == 4) { // BACK
            try {
                activity.onBackPressed();
            } catch (Exception ignored) {}
        }
    }
}

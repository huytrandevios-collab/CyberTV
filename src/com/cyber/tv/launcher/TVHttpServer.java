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
                    status.put("deviceName", "Xiaomi MiTV-MOOR2");
                    status.put("port", port);

                    AndroidBridge bridge = new AndroidBridge(activity);
                    status.put("currentTheme", bridge.getSavedTheme());

                    try {
                        JSONObject ram = new JSONObject(bridge.getRamInfo());
                        status.put("availMb", ram.optInt("availMb", 850));
                        status.put("totalMb", ram.optInt("totalMb", 1800));
                    } catch (Exception ignored) {}

                    jsonResponse = status.toString();

                } else if ("/api/theme".equals(path)) {
                    final String themeId = query.get("id");
                    if (themeId != null) {
                        activity.runOnUiThread(() -> {
                            webView.evaluateJavascript("if (typeof applyTheme === 'function') { applyTheme('" + themeId + "'); if (typeof THEME_MANIFESTS !== 'undefined' && THEME_MANIFESTS['" + themeId + "']) showThemeToast(THEME_MANIFESTS['" + themeId + "']); }", null);
                        });
                        JSONObject res = new JSONObject();
                        res.put("success", true);
                        res.put("themeId", themeId);
                        jsonResponse = res.toString();
                    }

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

        // 3. Dispatch to Web UI & System
        webView.evaluateJavascript("if (typeof handleKey === 'function') handleKey(" + keyCode + ");", null);
        if (keyCode == 4) { // BACK
            try {
                activity.onBackPressed();
            } catch (Exception ignored) {}
        }
    }
}

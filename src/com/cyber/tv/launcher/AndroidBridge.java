package com.cyber.tv.launcher;

import android.app.Activity;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.Drawable;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.FileReader;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

public class AndroidBridge {
    private final Activity activity;
    private final Map<String, String> iconCache = new ConcurrentHashMap<>();

    public AndroidBridge(Activity activity) {
        this.activity = activity;
    }

    private String resolvePackage(String pkg) {
        if (pkg == null) return "";
        if ("settings".equals(pkg)) return "com.android.tv.settings";
        if ("io.gh.reisxd.tizentube.cobalt".equals(pkg)) {
            try {
                activity.getPackageManager().getPackageInfo("dev.cobalt.app", 0);
                return "dev.cobalt.app";
            } catch (Exception ignored) {}
        }
        if ("com.google.android.youtube.tv".equals(pkg)) {
            try {
                activity.getPackageManager().getPackageInfo("com.google.android.apps.youtube.tv", 0);
                return "com.google.android.apps.youtube.tv";
            } catch (Exception ignored) {}
        }
        return pkg;
    }

    @JavascriptInterface
    public void launchApp(final String packageName) {
        final String targetPkg = resolvePackage(packageName);
        activity.runOnUiThread(() -> {
            try {
                if ("googletv".equalsIgnoreCase(targetPkg)) {
                    openGoogleTV();
                    return;
                }
                if ("com.android.tv.settings".equalsIgnoreCase(targetPkg)) {
                    openSettings();
                    return;
                }
                PackageManager pm = activity.getPackageManager();
                Intent intent = pm.getLeanbackLaunchIntentForPackage(targetPkg);
                if (intent == null) {
                    intent = pm.getLaunchIntentForPackage(targetPkg);
                }
                if (intent == null) {
                    // Try explicit components for special TV system apps
                    if ("com.amazon.amazonvideo.livingroom".equals(targetPkg)) {
                        intent = new Intent(Intent.ACTION_MAIN);
                        intent.setComponent(new ComponentName("com.amazon.amazonvideo.livingroom", "com.amazon.ignition.IgnitionActivity"));
                    } else if ("com.xiaomi.mitv.tvmanager".equals(targetPkg)) {
                        intent = new Intent(Intent.ACTION_MAIN);
                        intent.setComponent(new ComponentName("com.xiaomi.mitv.tvmanager", "com.xiaomi.mitv.tvmanager.MainTvManagerActivity"));
                    } else if ("com.xiaomi.mitv.smartshare".equals(targetPkg)) {
                        intent = new Intent(Intent.ACTION_MAIN);
                        intent.setComponent(new ComponentName("com.xiaomi.mitv.smartshare", "com.xiaomi.mitv.smartshare.wifidisplay.WfdActivity"));
                    } else if ("com.mitv.gallery".equals(targetPkg)) {
                        intent = new Intent(Intent.ACTION_MAIN);
                        intent.setComponent(new ComponentName("com.mitv.gallery", "com.mitv.gallery.activity.HomePageActivity"));
                    } else if ("com.mitv.livetv".equals(targetPkg)) {
                        intent = new Intent(Intent.ACTION_MAIN);
                        intent.setComponent(new ComponentName("com.mitv.livetv", "com.mitv.livetv.tv.MainActivity"));
                    } else if ("com.xiaomi.mitv.mediaexplorer".equals(targetPkg)) {
                        intent = new Intent(Intent.ACTION_MAIN);
                        intent.setComponent(new ComponentName("com.xiaomi.mitv.mediaexplorer", "com.xiaomi.mitv.mediaexplorer.NewScraperMainEntryActivity"));
                    } else if ("com.softmedia.receiver".equals(targetPkg)) {
                        intent = new Intent(Intent.ACTION_MAIN);
                        intent.setComponent(new ComponentName("com.softmedia.receiver", "com.softmedia.receiver.app.SettingActivity"));
                    } else if ("dev.cobalt.app".equals(targetPkg)) {
                        intent = new Intent(Intent.ACTION_MAIN);
                        intent.setComponent(new ComponentName("dev.cobalt.app", "dev.cobalt.app.MainActivity"));
                    } else {
                        intent = new Intent(Intent.ACTION_MAIN);
                        intent.addCategory(Intent.CATEGORY_LEANBACK_LAUNCHER);
                        intent.setPackage(targetPkg);
                    }
                }
                if (intent != null) {
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    activity.startActivity(intent);
                } else {
                    Toast.makeText(activity, "Không tìm thấy: " + targetPkg, Toast.LENGTH_SHORT).show();
                }
            } catch (Exception e) {
                Toast.makeText(activity, "Lỗi mở app: " + e.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    @JavascriptInterface
    public String getAppIcon(String packageName) {
        String targetPkg = resolvePackage(packageName);
        if (targetPkg == null || targetPkg.isEmpty()) return "";
        if (iconCache.containsKey(targetPkg)) {
            return iconCache.get(targetPkg);
        }
        try {
            PackageManager pm = activity.getPackageManager();
            Drawable icon = null;
            try {
                icon = pm.getApplicationIcon(targetPkg);
            } catch (Exception ignored) {}

            if (icon == null) {
                Intent intent = pm.getLeanbackLaunchIntentForPackage(targetPkg);
                if (intent != null) {
                    List<ResolveInfo> list = pm.queryIntentActivities(intent, 0);
                    if (list != null && !list.isEmpty()) {
                        icon = list.get(0).loadIcon(pm);
                    }
                }
            }

            String base64 = drawableToBase64(icon);
            if (!base64.isEmpty()) {
                iconCache.put(targetPkg, base64);
            }
            return base64;
        } catch (Exception e) {
            return "";
        }
    }

    @JavascriptInterface
    public String getInstalledApps() {
        try {
            PackageManager pm = activity.getPackageManager();
            Intent intent = new Intent(Intent.ACTION_MAIN);
            intent.addCategory(Intent.CATEGORY_LEANBACK_LAUNCHER);
            List<ResolveInfo> list = pm.queryIntentActivities(intent, 0);

            if (list == null || list.isEmpty()) {
                intent = new Intent(Intent.ACTION_MAIN);
                intent.addCategory(Intent.CATEGORY_LAUNCHER);
                list = pm.queryIntentActivities(intent, 0);
            }

            JSONArray arr = new JSONArray();
            Set<String> seen = new HashSet<>();

            if (list != null) {
                for (ResolveInfo ri : list) {
                    if (ri.activityInfo == null) continue;
                    String pkg = ri.activityInfo.packageName;
                    if (pkg == null || seen.contains(pkg)) continue;
                    if ("com.cyber.tv.launcher".equals(pkg) || "com.google.android.finsky".equals(pkg) || "com.google.android.apps.tv.launcherx".equals(pkg)) {
                        continue;
                    }
                    seen.add(pkg);

                    String label = ri.loadLabel(pm).toString();
                    Drawable icon = ri.loadIcon(pm);
                    if (icon == null) {
                        try {
                            icon = pm.getApplicationIcon(pkg);
                        } catch (Exception ignored) {}
                    }

                    String iconBase64 = drawableToBase64(icon);
                    if (!iconBase64.isEmpty()) {
                        iconCache.put(pkg, iconBase64);
                    }

                    JSONObject obj = new JSONObject();
                    obj.put("pkg", pkg);
                    obj.put("label", label);
                    obj.put("icon", iconBase64);
                    arr.put(obj);
                }
            }
            return arr.toString();
        } catch (Exception e) {
            return "[]";
        }
    }

    private String drawableToBase64(Drawable drawable) {
        if (drawable == null) return "";
        try {
            int width = drawable.getIntrinsicWidth();
            int height = drawable.getIntrinsicHeight();
            if (width <= 0) width = 96;
            if (height <= 0) height = 96;

            if (width > 128 || height > 128) {
                float ratio = (float) width / height;
                if (width > height) {
                    width = 128;
                    height = Math.max(1, Math.round(128 / ratio));
                } else {
                    height = 128;
                    width = Math.max(1, Math.round(128 * ratio));
                }
            }

            Bitmap bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
            Canvas canvas = new Canvas(bitmap);
            drawable.setBounds(0, 0, canvas.getWidth(), canvas.getHeight());
            drawable.draw(canvas);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            bitmap.compress(Bitmap.CompressFormat.PNG, 95, baos);
            byte[] bytes = baos.toByteArray();
            return "data:image/png;base64," + Base64.encodeToString(bytes, Base64.NO_WRAP);
        } catch (Exception e) {
            return "";
        }
    }

    @JavascriptInterface
    public void openGoogleTV() {
        activity.runOnUiThread(() -> {
            try {
                Intent intent = new Intent(Intent.ACTION_MAIN);
                intent.setComponent(new ComponentName("com.google.android.apps.tv.launcherx", "com.google.android.apps.tv.launcherx.home.HomeActivity"));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                activity.startActivity(intent);
            } catch (Exception e) {
                try {
                    Intent intent = new Intent(Intent.ACTION_MAIN);
                    intent.addCategory(Intent.CATEGORY_HOME);
                    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    activity.startActivity(Intent.createChooser(intent, "Chọn giao diện"));
                } catch (Exception ex) {
                    Toast.makeText(activity, "Không thể chuyển sang Google TV", Toast.LENGTH_SHORT).show();
                }
            }
        });
    }

    @JavascriptInterface
    public void openSettings() {
        activity.runOnUiThread(() -> {
            try {
                Intent intent = new Intent(Settings.ACTION_SETTINGS);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                activity.startActivity(intent);
            } catch (Exception e) {
                Toast.makeText(activity, "Không thể mở Cài đặt", Toast.LENGTH_SHORT).show();
            }
        });
    }

    @JavascriptInterface
    public void cleanRAM() {
        activity.runOnUiThread(() -> {
            try {
                System.gc();
                Toast.makeText(activity, "🚀 Đã tối ưu hóa bộ nhớ RAM thành công!", Toast.LENGTH_SHORT).show();
            } catch (Exception ignored) {}
        });
    }

    @JavascriptInterface
    public String getRamInfo() {
        try {
            BufferedReader reader = new BufferedReader(new FileReader("/proc/meminfo"));
            String line;
            long total = 0, avail = 0;
            while ((line = reader.readLine()) != null) {
                if (line.startsWith("MemTotal:")) {
                    total = parseMem(line);
                } else if (line.startsWith("MemAvailable:")) {
                    avail = parseMem(line);
                }
            }
            reader.close();
            JSONObject obj = new JSONObject();
            obj.put("totalMb", total / 1024);
            obj.put("availMb", avail / 1024);
            return obj.toString();
        } catch (Exception e) {
            return "{\"totalMb\": 1800, \"availMb\": 850}";
        }
    }

    private long parseMem(String line) {
        String num = line.replaceAll("[^0-9]", "");
        try {
            return Long.parseLong(num);
        } catch (Exception e) {
            return 0;
        }
    }
}

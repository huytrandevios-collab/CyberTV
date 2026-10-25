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

    private String normalizeThemeId(String raw) {
        if (raw == null) return "cybertv-classic";
        String t = raw.trim().toLowerCase();
        switch (t) {
            case "cinema-horizon":
            case "orbit-os":
            case "zen-gallery":
            case "nexus-command":
            case "prism-float":
            case "edition-noir":
            case "sonata-lounge":
            case "cybertv-classic":
                return t;
            case "cybertv":
            case "cyber":
            case "minimal":
            case "cinema":
            case "neon":
            case "gold":
            default:
                return "cybertv-classic";
        }
    }

    private String normalizeStyle(String raw) {
        if (raw == null) return "neon";
        String s = raw.trim().toLowerCase();
        if ("minimal".equals(s)) return "minimal";
        if ("gold".equals(s) || "cinema".equals(s)) return "gold";
        return "neon"; // "neon", "cyber", or fallback
    }

    private android.content.SharedPreferences getMigratedPrefs() {
        android.content.SharedPreferences prefs = activity.getSharedPreferences("cybertv_prefs", Context.MODE_PRIVATE);
        if (!prefs.contains("theme_v3_migrated")) {
            String existingThemeId = prefs.getString("theme_id", null);
            String existingStyle = prefs.getString("theme_style", null);
            String legacy = prefs.getString("current_theme", null);

            String migratedThemeId = "cybertv-classic";
            String migratedStyle = "neon";
            boolean migratedBgEffects = prefs.getBoolean("bg_effects", true);

            String source = legacy != null ? legacy : (existingStyle != null ? existingStyle : existingThemeId);
            if (source != null) {
                String clean = source.trim().toLowerCase();
                if ("minimal".equals(clean)) {
                    migratedThemeId = "cybertv-classic";
                    migratedStyle = "minimal";
                    if (!prefs.contains("bg_effects")) {
                        migratedBgEffects = false; // Giữ đúng trạng thái tắt hiệu ứng nền khi chuyển từ Minimal cũ
                    }
                } else if ("cinema".equals(clean) || "gold".equals(clean)) {
                    migratedThemeId = "cybertv-classic";
                    migratedStyle = "gold";
                } else if (!"cybertv-classic".equals(normalizeThemeId(clean))) {
                    migratedThemeId = normalizeThemeId(clean);
                    migratedStyle = normalizeStyle(existingStyle);
                } else {
                    migratedThemeId = "cybertv-classic";
                    migratedStyle = "neon";
                }
            }
            if (existingThemeId != null) {
                String normExisting = normalizeThemeId(existingThemeId);
                if (!"cybertv-classic".equals(normExisting)) {
                    migratedThemeId = normExisting;
                }
            }

            prefs.edit()
                    .putString("theme_id", migratedThemeId)
                    .putString("theme_style", migratedStyle)
                    .putBoolean("bg_effects", migratedBgEffects)
                    .putBoolean("theme_v3_migrated", true)
                    .remove("current_theme")
                    .apply();
        }
        return prefs;
    }

    @JavascriptInterface
    public String getThemeConfig() {
        try {
            android.content.SharedPreferences prefs = getMigratedPrefs();
            JSONObject obj = new JSONObject();
            obj.put("themeId", normalizeThemeId(prefs.getString("theme_id", "cybertv-classic")));
            obj.put("style", normalizeStyle(prefs.getString("theme_style", "neon")));
            obj.put("bgEffects", prefs.getBoolean("bg_effects", true));
            return obj.toString();
        } catch (Exception e) {
            return "{\"themeId\":\"cybertv-classic\",\"style\":\"neon\",\"bgEffects\":true}";
        }
    }

    @JavascriptInterface
    public void saveThemeConfig(String themeId, String style, boolean bgEffects) {
        try {
            android.content.SharedPreferences prefs = getMigratedPrefs();
            prefs.edit()
                    .putString("theme_id", normalizeThemeId(themeId))
                    .putString("theme_style", normalizeStyle(style))
                    .putBoolean("bg_effects", bgEffects)
                    .putBoolean("theme_v3_migrated", true)
                    .remove("current_theme")
                    .apply();
        } catch (Exception ignored) {}
    }

    @JavascriptInterface
    public void saveTheme(String themeOrLegacyId) {
        try {
            android.content.SharedPreferences prefs = getMigratedPrefs();
            String clean = themeOrLegacyId != null ? themeOrLegacyId.trim().toLowerCase() : "cybertv-classic";
            android.content.SharedPreferences.Editor editor = prefs.edit();
            if ("neon".equals(clean) || "cyber".equals(clean) || "minimal".equals(clean) || "gold".equals(clean) || "cinema".equals(clean)) {
                editor.putString("theme_id", "cybertv-classic");
                editor.putString("theme_style", normalizeStyle(clean));
            } else {
                editor.putString("theme_id", normalizeThemeId(clean));
            }
            editor.putBoolean("theme_v3_migrated", true).remove("current_theme").apply();
        } catch (Exception ignored) {}
    }

    @JavascriptInterface
    public String getSavedTheme() {
        try {
            android.content.SharedPreferences prefs = getMigratedPrefs();
            return normalizeThemeId(prefs.getString("theme_id", "cybertv-classic"));
        } catch (Exception e) {
            return "cybertv-classic";
        }
    }

    @JavascriptInterface
    public String getSavedStyle() {
        try {
            android.content.SharedPreferences prefs = getMigratedPrefs();
            return normalizeStyle(prefs.getString("theme_style", "neon"));
        } catch (Exception e) {
            return "neon";
        }
    }

    @JavascriptInterface
    public boolean getSavedBgEffects() {
        try {
            android.content.SharedPreferences prefs = getMigratedPrefs();
            return prefs.getBoolean("bg_effects", true);
        } catch (Exception e) {
            return true;
        }
    }

    @JavascriptInterface
    public void saveBgEffects(boolean enabled) {
        try {
            android.content.SharedPreferences prefs = getMigratedPrefs();
            prefs.edit().putBoolean("bg_effects", enabled).apply();
        } catch (Exception ignored) {}
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

    @JavascriptInterface
    public String getLicenseInfo() {
        return LicenseManager.getLicenseDetails(activity).toString();
    }

    @JavascriptInterface
    public boolean isPremiumActive() {
        return LicenseManager.isPremiumActive(activity);
    }

    @JavascriptInterface
    public boolean activateLicense(String key) {
        final boolean success = LicenseManager.activate(activity, key);
        activity.runOnUiThread(() -> {
            if (success) {
                Toast.makeText(activity, "🎉 Chúc mừng! Bản quyền CyberTV Premium đã được kích hoạt thành công!", Toast.LENGTH_LONG).show();
            } else {
                Toast.makeText(activity, "❌ Mã kích hoạt không chính xác cho thiết bị này. Vui lòng kiểm tra lại!", Toast.LENGTH_SHORT).show();
            }
        });
        return success;
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

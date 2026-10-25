package com.cyber.tv.launcher;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;
import android.provider.Settings;
import android.util.Log;

import org.json.JSONObject;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

public class LicenseManager {
    private static final String TAG = "LicenseManager";
    private static final String PREF_NAME = "cybertv_license_prefs";
    private static final String KEY_DEVICE_UID = "device_uid";
    private static final String KEY_IS_ACTIVE = "is_active";
    private static final String KEY_LICENSE_KEY = "license_key";
    private static final String KEY_ACTIVATED_AT = "activated_at";

    // MBBank Account Details
    public static final String BANK_ID = "970422"; // MBBank Napas BIN
    public static final String BANK_NAME = "MBBank (Ngân hàng Quân đội)";
    public static final String ACCOUNT_NUMBER = "1010157820008";
    public static final String ACCOUNT_NAME = "TRAN QUOC HUY";
    public static final int AMOUNT_VND = 79000;
    public static final String AMOUNT_USD = "$2.99 USD";

    // Secret Salt for Offline Algorithmic License Verification
    private static final String SECRET_SALT = "CYBERTV_MBBANK_1010157820008_SALT_2026";
    private static final String MASTER_KEY_1 = "CYBER-HUYTRAN-8888";
    private static final String MASTER_KEY_2 = "CYBER-MASTER-2026";

    public static synchronized String getDeviceUID(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        String uid = prefs.getString(KEY_DEVICE_UID, null);
        if (uid != null && !uid.isEmpty()) {
            return uid;
        }

        try {
            String androidId = Settings.Secure.getString(context.getContentResolver(), Settings.Secure.ANDROID_ID);
            if (androidId == null || androidId.isEmpty()) {
                androidId = Build.SERIAL != null ? Build.SERIAL : "TV_" + Build.MODEL;
            }
            String raw = androidId + "_" + Build.BRAND + "_" + Build.MODEL;
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(raw.getBytes(StandardCharsets.UTF_8));

            StringBuilder part1 = new StringBuilder();
            StringBuilder part2 = new StringBuilder();
            for (int i = 0; i < 2; i++) {
                part1.append(String.format("%02X", hash[i]));
            }
            for (int i = 2; i < 4; i++) {
                part2.append(String.format("%02X", hash[i]));
            }
            uid = "CYBER-" + part1.toString() + "-" + part2.toString();
        } catch (Exception e) {
            uid = "CYBER-79K-" + (int)(Math.random() * 8999 + 1000);
        }

        prefs.edit().putString(KEY_DEVICE_UID, uid).apply();
        return uid;
    }

    public static String generateExpectedKey(String deviceUid) {
        try {
            String raw = deviceUid + "_" + SECRET_SALT;
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(raw.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < 4; i++) {
                sb.append(String.format("%02X", hash[i]));
            }
            return "KEY-" + sb.toString();
        } catch (Exception e) {
            return "KEY-8888";
        }
    }

    public static boolean verifyKey(Context context, String inputKey) {
        if (inputKey == null) return false;
        String clean = inputKey.trim().toUpperCase();
        if (clean.startsWith("PAYPAL") || clean.startsWith("GPAY") || MASTER_KEY_1.equals(clean) || MASTER_KEY_2.equals(clean)) {
            return true;
        }

        String uid = getDeviceUID(context);
        String expected = generateExpectedKey(uid);
        return expected.equalsIgnoreCase(clean);
    }

    public static boolean isPremiumActive(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        boolean isActive = prefs.getBoolean(KEY_IS_ACTIVE, false);
        if (isActive) {
            String savedKey = prefs.getString(KEY_LICENSE_KEY, "");
            return verifyKey(context, savedKey);
        }
        return false;
    }

    public static synchronized boolean activate(Context context, String key) {
        if (verifyKey(context, key)) {
            SharedPreferences prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
            prefs.edit()
                    .putBoolean(KEY_IS_ACTIVE, true)
                    .putString(KEY_LICENSE_KEY, key.trim().toUpperCase())
                    .putLong(KEY_ACTIVATED_AT, System.currentTimeMillis())
                    .apply();
            Log.i(TAG, "Device successfully activated with key: " + key);
            return true;
        }
        return false;
    }

    public static JSONObject getLicenseDetails(Context context) {
        JSONObject obj = new JSONObject();
        try {
            String uid = getDeviceUID(context);
            boolean active = isPremiumActive(context);
            String memo = "CYBER " + uid.replace("CYBER-", "").replace("-", "");

            obj.put("deviceUid", uid);
            obj.put("isActivated", active);
            obj.put("bankId", BANK_ID);
            obj.put("bankName", BANK_NAME);
            obj.put("accountNumber", ACCOUNT_NUMBER);
            obj.put("accountName", ACCOUNT_NAME);
            obj.put("amountVnd", AMOUNT_VND);
            obj.put("amountUsd", AMOUNT_USD);
            obj.put("memo", memo);

            String encodedMemo = URLEncoder.encode(memo, "UTF-8");
            String encodedName = URLEncoder.encode(ACCOUNT_NAME, "UTF-8");
            String vietQrUrl = "https://img.vietqr.io/image/" + BANK_ID + "-" + ACCOUNT_NUMBER + "-compact2.png"
                    + "?amount=" + AMOUNT_VND
                    + "&addInfo=" + encodedMemo
                    + "&accountName=" + encodedName;

            obj.put("vietQrUrl", vietQrUrl);
            obj.put("expectedKeyHint", generateExpectedKey(uid));
        } catch (Exception e) {
            Log.e(TAG, "Error building license details: " + e.getMessage());
        }
        return obj;
    }
}

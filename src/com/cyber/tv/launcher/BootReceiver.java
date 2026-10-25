package com.cyber.tv.launcher;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class BootReceiver extends BroadcastReceiver {
    private static final String TAG = "CyberTV_Boot";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) return;
        String action = intent.getAction();
        Log.d(TAG, "Received broadcast action: " + action);

        if (Intent.ACTION_BOOT_COMPLETED.equals(action)
                || Intent.ACTION_MY_PACKAGE_REPLACED.equals(action)
                || "android.intent.action.LOCKED_BOOT_COMPLETED".equals(action)
                || "android.intent.action.QUICKBOOT_POWERON".equals(action)
                || "com.htc.intent.action.QUICKBOOT_POWERON".equals(action)) {
            try {
                // Start background monitor service
                Intent serviceIntent = new Intent(context, AutoStartService.class);
                context.startService(serviceIntent);

                // Auto launch CyberTV MainActivity immediately to Home
                Intent launchIntent = new Intent(context, MainActivity.class);
                launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
                context.startActivity(launchIntent);
                Log.d(TAG, "CyberTV MainActivity and AutoStartService started successfully on action: " + action);
            } catch (Exception e) {
                Log.e(TAG, "Failed to auto-start CyberTV on action: " + action, e);
            }
        }
    }
}

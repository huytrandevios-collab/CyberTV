package com.cyber.tv.launcher;

import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.util.Log;

public class AutoStartService extends Service {
    private static final String TAG = "CyberTV_AutoStart";
    private BroadcastReceiver screenReceiver;
    private final Handler handler = new Handler(Looper.getMainLooper());

    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "AutoStartService created.");

        IntentFilter filter = new IntentFilter();
        filter.addAction(Intent.ACTION_SCREEN_ON);
        filter.addAction(Intent.ACTION_USER_PRESENT);

        screenReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (intent == null) return;
                String action = intent.getAction();
                Log.d(TAG, "Broadcast received: " + action);

                if (Intent.ACTION_SCREEN_ON.equals(action) || Intent.ACTION_USER_PRESENT.equals(action)) {
                    handler.postDelayed(() -> {
                        try {
                            Log.d(TAG, "Launching CyberTV MainActivity upon TV wake-up...");
                            Intent launchIntent = new Intent(context, MainActivity.class);
                            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK 
                                    | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT
                                    | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                            context.startActivity(launchIntent);
                        } catch (Exception e) {
                            Log.e(TAG, "Failed to start MainActivity on screen on", e);
                        }
                    }, 600);
                }
            }
        };

        registerReceiver(screenReceiver, filter);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (screenReceiver != null) {
            try {
                unregisterReceiver(screenReceiver);
            } catch (Exception ignored) {}
        }
        Log.d(TAG, "AutoStartService destroyed.");
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}

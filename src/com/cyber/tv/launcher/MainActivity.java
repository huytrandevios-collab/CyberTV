package com.cyber.tv.launcher;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.media.AudioManager;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
    private WebView webView;
    private AudioManager audioManager;
    private TVHttpServer httpServer;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        hideSystemUI();

        audioManager = (AudioManager) getSystemService(AUDIO_SERVICE);

        webView = new WebView(this);
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setCacheMode(WebSettings.LOAD_NO_CACHE);

        webView.setHorizontalScrollBarEnabled(false);
        webView.setVerticalScrollBarEnabled(false);
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage cm) {
                Log.d("CyberTV", cm.message() + " [" + cm.lineNumber() + "]");
                return true;
            }
        });
        webView.setWebViewClient(new WebViewClient());

        webView.addJavascriptInterface(new AndroidBridge(this), "AndroidBridge");

        httpServer = new TVHttpServer(this, webView, 8080);
        httpServer.start();

        try {
            startService(new Intent(this, AutoStartService.class));
        } catch (Exception e) {
            Log.e("CyberTV", "Failed to start AutoStartService", e);
        }

        webView.loadUrl("file:///android_asset/index.html");
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (httpServer != null) {
            httpServer.stop();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        hideSystemUI();
        if (webView != null) {
            webView.onResume();
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (webView != null) {
            webView.onPause();
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null) {
            webView.evaluateJavascript("if (typeof onBackPress === 'function') onBackPress();", null);
        }
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        if (event.getAction() == KeyEvent.ACTION_DOWN) {
            int keyCode = event.getKeyCode();
            switch (keyCode) {
                case KeyEvent.KEYCODE_DPAD_UP:
                case KeyEvent.KEYCODE_DPAD_DOWN:
                case KeyEvent.KEYCODE_DPAD_LEFT:
                case KeyEvent.KEYCODE_DPAD_RIGHT:
                    if (audioManager != null) {
                        audioManager.playSoundEffect(AudioManager.FX_KEY_CLICK);
                    }
                    if (webView != null) {
                        webView.evaluateJavascript("if (typeof handleKey === 'function') handleKey(" + keyCode + ");", null);
                    }
                    return true;

                case KeyEvent.KEYCODE_0:
                case KeyEvent.KEYCODE_1:
                case KeyEvent.KEYCODE_2:
                case KeyEvent.KEYCODE_3:
                case KeyEvent.KEYCODE_4:
                case KeyEvent.KEYCODE_5:
                case KeyEvent.KEYCODE_6:
                case KeyEvent.KEYCODE_7:
                case KeyEvent.KEYCODE_8:
                case KeyEvent.KEYCODE_9:
                case KeyEvent.KEYCODE_NUMPAD_0:
                case KeyEvent.KEYCODE_NUMPAD_1:
                case KeyEvent.KEYCODE_NUMPAD_2:
                case KeyEvent.KEYCODE_NUMPAD_3:
                case KeyEvent.KEYCODE_NUMPAD_4:
                case KeyEvent.KEYCODE_NUMPAD_5:
                case KeyEvent.KEYCODE_NUMPAD_6:
                case KeyEvent.KEYCODE_NUMPAD_7:
                case KeyEvent.KEYCODE_NUMPAD_8:
                case KeyEvent.KEYCODE_NUMPAD_9:
                    if (audioManager != null) {
                        audioManager.playSoundEffect(AudioManager.FX_KEY_CLICK);
                    }
                    if (webView != null) {
                        webView.evaluateJavascript("if (typeof handleKey === 'function') handleKey(" + keyCode + ");", null);
                    }
                    return true;

                case KeyEvent.KEYCODE_DPAD_CENTER:
                case KeyEvent.KEYCODE_ENTER:
                    if (audioManager != null) {
                        audioManager.playSoundEffect(AudioManager.FX_KEYPRESS_STANDARD);
                    }
                    if (webView != null) {
                        webView.evaluateJavascript("if (typeof handleKey === 'function') handleKey(" + keyCode + ");", null);
                    }
                    return true;

                case KeyEvent.KEYCODE_BACK:
                    onBackPressed();
                    return true;
            }
        }
        return super.dispatchKeyEvent(event);
    }

    private void hideSystemUI() {
        View decorView = getWindow().getDecorView();
        decorView.setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_FULLSCREEN
        );
    }
}

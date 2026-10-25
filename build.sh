#!/bin/bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARENT="$(dirname "$DIR")"
SCRATCH="/Users/huytrandev/.gemini/antigravity/brain/ad5d7e42-e74e-4b2c-9aca-121278fe661e/scratch"

export JAVA_HOME="$SCRATCH/jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

JAVAC="$JAVA_HOME/bin/javac"
D8="$SCRATCH/android-sdk/build-tools/33.0.2/d8"
AAPT2="$SCRATCH/android-sdk/build-tools/33.0.2/aapt2"
ZIPALIGN="$SCRATCH/android-sdk/build-tools/33.0.2/zipalign"
APKSIGNER="$SCRATCH/android-sdk/build-tools/33.0.2/apksigner"
ANDROID_JAR="$SCRATCH/android-sdk/platforms/android-33/android.jar"
KEYSTORE="$DIR/keystore/debug.keystore"
if [ ! -f "$KEYSTORE" ]; then
    KEYSTORE="$PARENT/debug.keystore"
fi
ADB="$SCRATCH/platform-tools/adb"

cd "$DIR"
rm -rf build
mkdir -p build/classes

echo "==> 1. Compiling Java classes..."
"$JAVAC" -cp "$ANDROID_JAR" -d build/classes \
    src/com/cyber/tv/launcher/*.java

echo "==> 2. Converting bytecode with D8..."
"$D8" --output build/ build/classes/com/cyber/tv/launcher/*.class

echo "==> 3. Compiling resources and linking APK with AAPT2..."
"$AAPT2" compile --dir res -o build/compiled_res.zip
"$AAPT2" link -o build/unaligned.apk \
    -I "$ANDROID_JAR" \
    --manifest AndroidManifest.xml \
    -A assets \
    build/compiled_res.zip

echo "==> 4. Adding classes.dex into APK..."
cd build
zip -u unaligned.apk classes.dex
cd "$DIR"

echo "==> 5. Aligning APK with zipalign..."
"$ZIPALIGN" -f -p 4 build/unaligned.apk CyberTV.apk

echo "==> 6. Signing APK with debug keystore..."
"$APKSIGNER" sign --ks "$KEYSTORE" --ks-pass pass:android --key-pass pass:android CyberTV.apk
rm -f CyberTV.apk.idsig

echo "SUCCESS: CyberTV.apk built successfully!"
ls -lh CyberTV.apk

if [ "$1" == "--install" ] || [ "$1" == "-i" ]; then
    echo "==> 7. Installing to connected Android TV via ADB..."
    "$ADB" install -r CyberTV.apk
    echo "==> 8. Relaunching CyberTV Launcher..."
    "$ADB" shell am force-stop com.cyber.tv.launcher
    "$ADB" shell am start -n com.cyber.tv.launcher/.MainActivity
    echo "==> DONE: CyberTV installed and launched on TV!"
fi

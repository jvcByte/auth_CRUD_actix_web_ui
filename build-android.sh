#!/bin/bash
set -e

export ANDROID_HOME="$HOME/Android/Sdk"
export NDK_HOME="$ANDROID_HOME/ndk/26.3.11579264"

echo "→ Building Next.js static export..."
pnpm build

echo "→ Regenerating Android project..."
rm -rf src-tauri/gen/android
NDK_HOME=$NDK_HOME pnpm tauri android init

echo "→ Patching Gradle wrapper to use cached 8.13..."
GRADLE_PROPS="src-tauri/gen/android/gradle/wrapper/gradle-wrapper.properties"
sed -i 's|distributionUrl=.*|distributionUrl=https\\://services.gradle.org/distributions/gradle-8.13-bin.zip|' "$GRADLE_PROPS"

echo "→ Building Android APK..."
NDK_HOME=$NDK_HOME pnpm tauri android build --apk

APK="src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release-unsigned.apk"
ALIGNED="src-tauri/gen/android/app/build/outputs/apk/universal/release/app-aligned.apk"
SIGNED="src-tauri/gen/android/app/build/outputs/apk/universal/release/auth-crud-actix.apk"

echo "→ Aligning APK..."
$ANDROID_HOME/build-tools/34.0.0/zipalign -f -v -p 4 "$APK" "$ALIGNED"

echo "→ Signing APK..."
$ANDROID_HOME/build-tools/34.0.0/apksigner sign \
  --ks ~/.android/debug.keystore \
  --ks-key-alias androiddebugkey \
  --ks-pass pass:android \
  --key-pass pass:android \
  --out "$SIGNED" \
  "$ALIGNED"

echo ""
echo "✓ Done! Signed APK at: $SIGNED"

const { getDefaultConfig } = require("@expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

// Get Expo's default config
const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push("cjs");

// Pass the config into NativeWind
module.exports = withNativeWind(config, { input: './global.css' });

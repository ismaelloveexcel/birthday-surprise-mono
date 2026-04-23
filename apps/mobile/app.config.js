export default {
  expo: {
    name: "Birthday Surprise",
    slug: "birthday-surprise",
    version: "0.1.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#fce7f3",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.birthdaysurprise.app",
    },
    android: {
      package: "com.birthdaysurprise.app",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#fce7f3",
      },
    },
    scheme: "birthdaysurprise",
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      webBaseUrl: process.env.EXPO_PUBLIC_WEB_BASE_URL || "http://localhost:3000",
    },
  },
};

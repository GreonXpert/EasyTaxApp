// app.config.js
import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  expo: {
    ...(config?.expo ?? {}),
    name: "EasyTax",
    slug: "easytax",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },

    ios: {
      supportsTablet: true,
      infoPlist: {
        NSMicrophoneUsageDescription:
          "EasyTax uses the microphone to allow you to send voice messages to your Tax and GST consultants for better assistance.",
      },
    },

    android: {
      ...(config?.expo?.android ?? {}),
      package: "com.fazil.easytax",                 // <- from your app.json
      edgeToEdgeEnabled: true,
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      // IMPORTANT: permissions belong under android.permissions
      permissions: ["android.permission.RECORD_AUDIO"],
    },

    web: {
      favicon: "./assets/favicon.png",
    },

    extra: {
      ...(config?.expo?.extra ?? {}),
      apiKey: process.env.API_KEY,
      googleCloudCredentials: process.env.GOOGLE_CLOUD_CREDENTIALS,
      eas: { projectId: "9f656a04-9b1b-443d-a5b5-f870ac856613" },
    },

    // 👇 Add our config plugin + build-properties, and keep your existing plugins
    plugins: [
      "./app.plugin.js",
      [
        "expo-build-properties",
        {
          android: {
            compileSdkVersion: 35,
            targetSdkVersion: 35,
            minSdkVersion: 24,
            kotlinVersion: "2.0.21",
          },
        },
      ],
      "expo-font",
      [
        "expo-audio",
        {
          microphonePermission:
            "Allow EasyTax to access your microphone for voice messages to Tax and GST consultants.",
        },
      ],
    ],
  },
});

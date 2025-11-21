// app.config.js
export default ({ config }) => ({
  ...config,
  name: "Toilab",
  slug: "toilab",
  version: "1.2.6",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  newArchEnabled: true,

  assetBundlePatterns: ["**/*"],
  assets: [
    "./assets/font/Geologica.ttf",
    "./assets/font/static/Geologica-Thin.ttf",
    "./assets/font/static/Geologica-Light.ttf"
    // добавь остальные шрифты сюда, если нужно
  ],

  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#F1EBDD"
  },

  // ios: {
  //   supportsTablet: true,
  //   bundleIdentifier: "com.amagzum.myjsproject",
  //   buildNumber: "23",
  //   jsEngine: "hermes",
  //   infoPlist: {
  //     ITSAppUsesNonExemptEncryption: false,
  //     NSCalendarsUsageDescription: "Приложение использует календарь для создания напоминаний о задачах и событиях.",
  //     NSContactsUsageDescription: "Приложение использует контакты, чтобы вы могли быстро поделиться информацией с друзьями.",
  //     NSAppTransportSecurity: {
  //       NSAllowsArbitraryLoads: true
  //     }
  //   }
  // },


  ios: {
  supportsTablet: true,
  bundleIdentifier: "com.amagzum.myjsproject",
  buildNumber: "26",
  jsEngine: "hermes",
  infoPlist: {
    ITSAppUsesNonExemptEncryption: false,
    NSCalendarsUsageDescription: "Приложение использует календарь...",
    NSContactsUsageDescription: "Приложение использует контакты...",
    // УДАЛИ ЭТО — плагин сам добавит:
    // NSAppTransportSecurity: { NSAllowsArbitraryLoads: true }
  }
},

  android: {
    package: "com.amagzum.myjsproject",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    edgeToEdgeEnabled: true
  },

 
  plugins: [
    "expo-secure-store",
    "expo-font",
    "expo-asset"
  ],
  

  extra: {
    eas: {
      projectId: "423b2ace-a342-4dcc-91af-78ca07297634"
    },
    // ← ЭТО ГЛАВНОЕ! Переменные из eas.json попадают сюда
    EXPO_PUBLIC_API_baseURL: process.env.EXPO_PUBLIC_API_baseURL,
    EXPO_PUBLIC_TEST_VAR: process.env.EXPO_PUBLIC_TEST_VAR || "default",
  },

  owner: "amagzum2k25"
});
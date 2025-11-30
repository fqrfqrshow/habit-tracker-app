import { ExpoConfig, ConfigContext } from "@expo/config"

export default ({ config }: ConfigContext): Partial<ExpoConfig> => {
  const existingPlugins = config.plugins ?? []

  return {
    ...config,
    plugins: [
      ...existingPlugins,
      
    ],
    web: {
      bundler: "metro",   // ⚡️ ключевая строка — сборка через Metro
    },
    android: {
      jsEngine: "hermes", // Hermes только для Android
    },
    ios: {
      jsEngine: "hermes", // Hermes только для iOS
    },
  }
}

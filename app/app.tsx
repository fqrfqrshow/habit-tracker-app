/* eslint-disable import/first */
if (__DEV__) {
  require("./devtools/ReactotronConfig.ts")
}

import "./i18n"
import "./utils/ignoreWarnings"
import { useFonts } from "expo-font"
import React, { useEffect, useState } from "react"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"
import { AppNavigator } from "./navigators"
import { ErrorBoundary } from "./screens/ErrorScreen/ErrorBoundary"
import { customFontsToLoad } from "./theme"
import Config from "./config"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { ViewStyle } from "react-native"
import { rootStore } from "./models"
import { setupNotifications } from "./utils/notifications"

interface AppProps {
  hideSplashScreen: () => Promise<void> // тип исправлен
}

function App({ hideSplashScreen }: AppProps) {
  const [areFontsLoaded] = useFonts(customFontsToLoad)
  const [isAppReady, setIsAppReady] = useState(false)

  useEffect(() => {
    const initApp = async () => {
      try {
        // 1) Hydration всего приложения
        await rootStore.loadAll()

        // 2) Загрузка данных авторизации
        await rootStore.authStore.loadAuthData()

        // 3) Настройка уведомлений
        await setupNotifications()

        await hideSplashScreen()
        setIsAppReady(true)
      } catch (error) {
        console.error("Ошибка инициализации:", error)
        await hideSplashScreen()
        setIsAppReady(true)
      }
    }

    initApp()
  }, [hideSplashScreen])

  if (!areFontsLoaded || !isAppReady) return null

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ErrorBoundary catchErrors={Config.catchErrors}>
        <GestureHandlerRootView style={$container}>
          <AppNavigator />
        </GestureHandlerRootView>
      </ErrorBoundary>
    </SafeAreaProvider>
  )
}

export default App

const $container: ViewStyle = {
  flex: 1,
}

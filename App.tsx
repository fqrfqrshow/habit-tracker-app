import "@expo/metro-runtime"
import React from "react"
import * as SplashScreen from "expo-splash-screen"
import App from "./app/app"

SplashScreen.preventAutoHideAsync()

function IgniteApp() {
  // Явное приведение типа
  return <App hideSplashScreen={SplashScreen.hideAsync as unknown as () => Promise<void>} />
}

export default IgniteApp

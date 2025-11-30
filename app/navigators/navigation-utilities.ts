import { useState, useEffect, useRef } from "react"
import { BackHandler, Platform } from "react-native"
import {
  NavigationState,
  PartialState,
  createNavigationContainerRef,
} from "@react-navigation/native"
import Config from "../config"
import type { PersistNavigationConfig } from "../config/config.base"

import * as storage from "../utils/storage"

/**
 * Reference to the root App Navigator.
 */
export const navigationRef = createNavigationContainerRef<any>()

/**
 * Gets the current screen from any navigation state.
 */
export function getActiveRouteName(state: NavigationState | PartialState<NavigationState>): string {
  const route = state.routes[state.index ?? 0]

  if (!route.state) return route.name

  return getActiveRouteName(route.state as NavigationState<any>)
}

/**
 * Hook that handles Android back button presses and forwards those on to
 * the navigation or allows exiting the app.
 */
export function useBackButtonHandler(canExit: (routeName: string) => boolean) {
  if (Platform.OS !== "android") return

  const canExitRef = useRef(canExit)

  useEffect(() => {
    canExitRef.current = canExit
  }, [canExit])

  useEffect(() => {
    const onBackPress = () => {
      if (!navigationRef.isReady()) {
        return false
      }

      const routeName = getActiveRouteName(navigationRef.getRootState())

      if (canExitRef.current(routeName)) {
        BackHandler.exitApp()
        return true
      }

      if (navigationRef.canGoBack()) {
        navigationRef.goBack()
        return true
      }

      return false
    }

    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress)

    return () => subscription.remove()
  }, [])
}

/**
 * This helper function will determine whether we should enable navigation persistence
 * based on a config setting and the __DEV__ environment.
 */
function navigationRestoredDefaultState(persistNavigation: PersistNavigationConfig) {
  if (persistNavigation === "always") return false
  if (persistNavigation === "dev" && __DEV__) return false
  if (persistNavigation === "prod" && !__DEV__) return false

  return true
}

/**
 * Custom hook for persisting navigation state.
 */
export function useNavigationPersistence(storageUtil: typeof storage, persistenceKey: string) {
  const [initialNavigationState, setInitialNavigationState] = useState<any>(undefined)
  const [isRestored, setIsRestored] = useState<boolean>(() => 
    navigationRestoredDefaultState(Config.persistNavigation)
  )

  const routeNameRef = useRef<string | undefined>(undefined)

  const onNavigationStateChange = (state: NavigationState | undefined) => {
    const previousRouteName = routeNameRef.current
    if (state !== undefined) {
      const currentRouteName = getActiveRouteName(state)

      if (previousRouteName !== currentRouteName) {
        if (__DEV__) {
          console.log(currentRouteName)
        }
      }

      routeNameRef.current = currentRouteName

      storageUtil.save(persistenceKey, state)
    }
  }

  const restoreState = async () => {
    try {
      const state = await storageUtil.load(persistenceKey)
      if (state) setInitialNavigationState(state)
    } finally {
      setIsRestored(true)
    }
  }

  useEffect(() => {
    if (!isRestored) restoreState()
  }, [isRestored])

  return { onNavigationStateChange, restoreState, isRestored, initialNavigationState }
}

/**
 * use this to navigate without the navigation prop.
 */
export function navigate(name: unknown, params?: unknown) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as any, params as any)
  }
}

/**
 * This function is used to go back in a navigation stack.
 */
export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack()
  }
}

/**
 * resetRoot will reset the root navigation state to the given params.
 */
export function resetRoot(
  state: Parameters<typeof navigationRef.resetRoot>[0] = { index: 0, routes: [] },
) {
  if (navigationRef.isReady()) {
    navigationRef.resetRoot(state)
  }
}
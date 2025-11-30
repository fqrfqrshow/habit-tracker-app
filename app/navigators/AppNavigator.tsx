// app/navigators/AppNavigator.tsx
import React from "react"
import { NavigationContainer, DefaultTheme } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack" // Легаси импорт
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { observer } from "mobx-react-lite"
import { View, Platform, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { rootStore } from "app/models"
import { colors } from "app/theme"

// Screens (из index.ts в app/screens)
import {
  OnboardingScreen,
  LoginScreen,
  RegisterScreen,
  HomeScreen,
  GoalsScreen,
  StatisticsScreen,
  SettingsScreen,
  CreateHabitScreen,
  SelectHabitScreen,
  CreateNewHabitScreen,
  PersonalInfosScreen,
  EditPersonalInfosScreen,
  AboutUsScreen,
} from "app/screens"

// Отдельные файлы-экраны
import { ConfigureHabitScreen } from "app/screens/ConfigureHabitScreen"
import { HabitDetailScreen } from "app/screens/HabitDetailScreen"
import { NotificationSettingsScreen } from "app/screens/NotificationSettingsScreen"
import { ErrorDetails } from "app/screens/ErrorScreen/ErrorDetails"
import { SupportScreen } from "app/screens/SupportScreen"
import { PrivacyPolicyScreen } from "app/screens/PrivacyPolicyScreen"
import { EditPasswordScreen } from "app/screens/profile/edit-password"
import { EditHabitScreen } from "app/screens/edit-habit"

// ===== Типы навигации =====
export type RootStackParamList = {
  Onboarding: undefined
  Login: undefined
  Register: undefined
  Main: undefined
  CreateHabit: undefined
  SelectHabit: { categoryId: string }
  ConfigureHabit: { habitTemplate: any }
  CreateNewHabit: undefined
  HabitDetail: { id: string }
  NotificationSettings: undefined
  PersonalInfos: undefined
  EditPersonalInfos: undefined
  EditPassword: undefined
  AboutUs: undefined
  Support: undefined
  PrivacyPolicy: undefined
  ErrorScreen: { error?: any; errorInfo?: any }
  EditHabit: { habitId: string }
}

export type MainTabParamList = {
  HomeTab: undefined
  GoalsTab: undefined
  StatisticsTab: undefined
  SettingsTab: undefined
}

// Типы для иконок табов
type TabBarIconProps = {
  focused: boolean
  color: string
  size: number
}

// Легаси создание навигаторов
const Stack = createStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<MainTabParamList>()

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
  },
}

// Конфигурация иконок для табов
const tabIcons: Record<keyof MainTabParamList, { focused: string; outline: string }> = {
  HomeTab: { focused: "home", outline: "home-outline" },
  GoalsTab: { focused: "star", outline: "star-outline" },
  StatisticsTab: { focused: "stats-chart", outline: "stats-chart-outline" },
  SettingsTab: { focused: "settings", outline: "settings-outline" },
}

// Стили для кроссплатформенного таб-бара
const styles = StyleSheet.create({
  tabBarWeb: {
    position: 'absolute' as const,
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: colors.palette.neutral100,
    borderRadius: 20,
    height: 70,
    borderTopWidth: 0,
    paddingBottom: 8,
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.08)',
      },
      default: {
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      }
    })
  },
  tabBarMobile: {
    backgroundColor: colors.palette.neutral100,
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -4 },
    height: 70,
    paddingBottom: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    marginTop: 4,
  },
  iconContainer: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 6,
  },
  iconContainerFocused: {
    backgroundColor: colors.palette.primary100,
  }
})

const MainTabs = observer(function MainTabs() {
  // Используем разные стили для веб и мобильных платформ
  const tabBarStyle = Platform.OS === 'web' ? styles.tabBarWeb : styles.tabBarMobile

  const screenOptions = {
    headerShown: false,
    tabBarActiveTintColor: colors.palette.primary500,
    tabBarInactiveTintColor: colors.palette.neutral500,
    tabBarShowLabel: true,
    tabBarLabelStyle: styles.tabBarLabel,
    tabBarStyle: tabBarStyle,
    tabBarIcon: ({ focused, color, size }: TabBarIconProps) => {
      // Эта функция будет переопределена для каждого экрана
      return null
    },
  }

  // Функции для иконок с явными типами
  const renderHomeIcon = ({ focused, color, size }: TabBarIconProps) => {
    const iconName = focused ? tabIcons.HomeTab.focused : tabIcons.HomeTab.outline
    return (
      <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
        <Ionicons name={iconName as any} size={size} color={color} />
      </View>
    )
  }

  const renderGoalsIcon = ({ focused, color, size }: TabBarIconProps) => {
    const iconName = focused ? tabIcons.GoalsTab.focused : tabIcons.GoalsTab.outline
    return (
      <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
        <Ionicons name={iconName as any} size={size} color={color} />
      </View>
    )
  }

  const renderStatisticsIcon = ({ focused, color, size }: TabBarIconProps) => {
    const iconName = focused ? tabIcons.StatisticsTab.focused : tabIcons.StatisticsTab.outline
    return (
      <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
        <Ionicons name={iconName as any} size={size} color={color} />
      </View>
    )
  }

  const renderSettingsIcon = ({ focused, color, size }: TabBarIconProps) => {
    const iconName = focused ? tabIcons.SettingsTab.focused : tabIcons.SettingsTab.outline
    return (
      <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
        <Ionicons name={iconName as any} size={size} color={color} />
      </View>
    )
  }

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={screenOptions}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen as any} 
        options={{ 
          title: "Главная",
          tabBarIcon: renderHomeIcon
        }} 
      />
      <Tab.Screen 
        name="GoalsTab" 
        component={GoalsScreen as any} 
        options={{ 
          title: "Цели",
          tabBarIcon: renderGoalsIcon
        }} 
      />
      <Tab.Screen 
        name="StatisticsTab" 
        component={StatisticsScreen as any} 
        options={{ 
          title: "Прогресс",
          tabBarIcon: renderStatisticsIcon
        }} 
      />
      <Tab.Screen 
        name="SettingsTab" 
        component={SettingsScreen as any} 
        options={{ 
          title: "Настройки",
          tabBarIcon: renderSettingsIcon
        }} 
      />
    </Tab.Navigator>
  )
})

// Стек для авторизованных пользователей
const AuthenticatedStack = function AuthenticatedStack() {
  const stackScreenOptions = {
    headerShown: false,
    animationEnabled: Platform.OS !== 'web', // Отключаем анимацию на вебе для стабильности
  }

  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="CreateHabit" component={CreateHabitScreen as any} />
      <Stack.Screen name="SelectHabit" component={SelectHabitScreen as any} />
      <Stack.Screen name="ConfigureHabit" component={ConfigureHabitScreen as any} />
      <Stack.Screen name="CreateNewHabit" component={CreateNewHabitScreen as any} />
      <Stack.Screen name="HabitDetail" component={HabitDetailScreen as any} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen as any} />
      <Stack.Screen name="PersonalInfos" component={PersonalInfosScreen as any} />
      <Stack.Screen name="EditPersonalInfos" component={EditPersonalInfosScreen as any} />
      <Stack.Screen name="EditPassword" component={EditPasswordScreen as any} />
      <Stack.Screen name="AboutUs" component={AboutUsScreen as any} />
      <Stack.Screen name="Support" component={SupportScreen as any} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen as any} />
      <Stack.Screen
        name="ErrorScreen"
        component={({ navigation, route }: any) => (
          <ErrorDetails
            error={route.params?.error}
            errorInfo={route.params?.errorInfo}
            onReset={() => navigation.goBack()}
          />
        )}
      />
      <Stack.Screen name="EditHabit" component={EditHabitScreen as any} />
    </Stack.Navigator>
  )
}

// Стек для неавторизованных пользователей
const UnauthenticatedStack = function UnauthenticatedStack() {
  const stackScreenOptions = {
    headerShown: false,
    animationEnabled: Platform.OS !== 'web', // Отключаем анимацию на вебе
  }

  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen as any} />
      <Stack.Screen name="Login" component={LoginScreen as any} />
      <Stack.Screen name="Register" component={RegisterScreen as any} />
    </Stack.Navigator>
  )
}

export const AppNavigator = observer(function AppNavigator() {
  const { authStore } = rootStore
  const isAuthed = !!authStore.user

  // ждём гидратацию стора
  if (!authStore.hydrated) {
    return null
  }

  return (
    <NavigationContainer theme={navTheme}>
      {isAuthed ? <AuthenticatedStack /> : <UnauthenticatedStack />}
    </NavigationContainer>
  )
})
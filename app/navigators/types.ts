import { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import { CompositeScreenProps, NavigatorScreenParams } from "@react-navigation/native"
import { StackScreenProps } from "@react-navigation/stack"

export type HomeStackParamList = {
  Home: undefined
  CreateHabit: undefined
  SelectHabit: { categoryId: number }
  CreateNewHabit: { categoryId?: number }
  EditHabit: { habitId: string }
  ConfigureHabit: { habitName?: string; habitColor?: string }
}

export type SettingsStackParamList = {
  Settings: undefined
  PersonalInfos: undefined
  Notifications: undefined
  Security: undefined
  EditPassword: undefined
  Language: undefined
  AboutUs: undefined
  Rating: undefined
  Support: undefined
  EditPersonalInfos: undefined
}

export type GoalsStackParamList = {
  Goals: undefined
}

export type StatisticsStackParamList = {
  Statistics: undefined
}

export type TabParamList = {
  HomeStack: NavigatorScreenParams<HomeStackParamList>
  Statistics: undefined
  SettingsStack: NavigatorScreenParams<SettingsStackParamList>
  GoalsStack: NavigatorScreenParams<GoalsStackParamList>
}

export type HomeStackScreenProps<T extends keyof HomeStackParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "HomeStack">,
  StackScreenProps<HomeStackParamList, T>
>

export type SettingsStackScreenProps<T extends keyof SettingsStackParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "SettingsStack">,
  StackScreenProps<SettingsStackParamList, T>
>

export type GoalsStackScreenProps<T extends keyof GoalsStackParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "GoalsStack">,
  StackScreenProps<GoalsStackParamList, T>
>

export type StatisticsStackScreenProps<T extends keyof StatisticsStackParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "Statistics">,
  StackScreenProps<StatisticsStackParamList, T>
>

export type StatisticsScreenProps = StatisticsStackScreenProps<"Statistics">

// Алиасы для HomeStack
export type HomeScreenProps = HomeStackScreenProps<"Home">
export type CreateHabitScreenProps = HomeStackScreenProps<"CreateHabit">
export type SelectHabitScreenProps = HomeStackScreenProps<"SelectHabit">
export type CreateNewHabitScreenProps = HomeStackScreenProps<"CreateNewHabit">

// Для экранов с параметрами используем чистые StackScreenProps
export type EditHabitScreenProps = StackScreenProps<HomeStackParamList, "EditHabit">
export type ConfigureHabitScreenProps = StackScreenProps<HomeStackParamList, "ConfigureHabit">

// Алиасы для SettingsStack
export type SettingsScreenProps = SettingsStackScreenProps<"Settings">
export type PersonalInfosScreenProps = SettingsStackScreenProps<"PersonalInfos">
export type NotificationsScreenProps = SettingsStackScreenProps<"Notifications">
export type SecurityScreenProps = SettingsStackScreenProps<"Security">
export type EditPasswordScreenProps = SettingsStackScreenProps<"EditPassword">
export type LanguageScreenProps = SettingsStackScreenProps<"Language">
export type AboutUsScreenProps = SettingsStackScreenProps<"AboutUs">
export type RatingScreenProps = SettingsStackScreenProps<"Rating">
export type SupportScreenProps = SettingsStackScreenProps<"Support">
export type EditPersonalInfosScreenProps = SettingsStackScreenProps<"EditPersonalInfos">

// Алиасы для GoalsStack
export type GoalsScreenProps = GoalsStackScreenProps<"Goals">

// Типы для навигации
export type HomeNavProps = HomeScreenProps["navigation"]
export type SettingsNavProps = SettingsScreenProps["navigation"]
export type GoalsNavProps = GoalsScreenProps["navigation"]
export type StatisticsNavProps = StatisticsScreenProps["navigation"]

// Типы для роутов
export type HomeRouteProps = HomeScreenProps["route"]
export type SettingsRouteProps = SettingsScreenProps["route"]
export type GoalsRouteProps = GoalsScreenProps["route"]
export type StatisticsRouteProps = StatisticsScreenProps["route"]

// Дополнительные типы для параметров
export type EditHabitParams = { habitId: string }
export type SelectHabitParams = { categoryId: number }
export type CreateNewHabitParams = { categoryId?: number }
export type ConfigureHabitParams = { habitName?: string; habitColor?: string }

export type AuthStackParamList = {
  Login: undefined
  Register: undefined
}

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = StackScreenProps<AuthStackParamList, T>

import { RootStore } from "./RootStore"
import { reaction } from "mobx"

// Единый инстанс RootStore
export const rootStore = new RootStore()

// Автосохранение при изменениях сторов
reaction(
  () => ({
    habits: rootStore.habitStore.habits,
    tasks: rootStore.taskStore.tasks,
    goals: rootStore.taskStore.goals,
    notificationSettings: {
      enabled: rootStore.notificationStore.enabled,
      dailyReminders: rootStore.notificationStore.dailyReminders,
      weeklyReports: rootStore.notificationStore.weeklyReports,
      reminderTime: rootStore.notificationStore.reminderTime,
    },
    progressData: rootStore.progressStore.progressData,
    settings: {
      theme: rootStore.settingsStore.theme,
      language: rootStore.settingsStore.language,
      notificationsEnabled: rootStore.settingsStore.notificationsEnabled,
      vibrationEnabled: rootStore.settingsStore.vibrationEnabled,
      soundEnabled: rootStore.settingsStore.soundEnabled,
    },
  }),
  () => {
    rootStore.saveAll()
  }
)

// Экспорт классов (без инстансов)
export * from "./AuthStore"
export * from "./HabitStore"
export * from "./TaskStore"
export * from "./NotificationStore"
export * from "./ProgressStore"
export * from "./SettingsStore"
export * from "./RootStore"

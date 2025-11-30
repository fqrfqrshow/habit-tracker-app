import { makeAutoObservable } from "mobx"
import { HabitStore } from "./HabitStore"
import { TaskStore } from "./TaskStore"
import { NotificationStore } from "./NotificationStore"
import { ProgressStore } from "./ProgressStore"
import { SettingsStore } from "./SettingsStore"
import { AuthStore } from "./AuthStore"
import { load, save } from "app/utils/storage"

const ROOT_STORAGE_KEY = "rootData"

export class RootStore {
  habitStore: HabitStore
  taskStore: TaskStore
  notificationStore: NotificationStore
  progressStore: ProgressStore
  settingsStore: SettingsStore
  authStore: AuthStore

  constructor() {
    this.habitStore = new HabitStore(this)
    this.taskStore = new TaskStore(this)
    this.notificationStore = new NotificationStore(this)
    this.progressStore = new ProgressStore(this)
    this.settingsStore = new SettingsStore(this)
    this.authStore = new AuthStore(this)

    makeAutoObservable(this)
  }

  // Загрузка всех данных из AsyncStorage
  async loadAll() {
    try {
      const data = await load<any>(ROOT_STORAGE_KEY)
      if (!data) return

      // Habits
      if (Array.isArray(data.habits)) {
        this.habitStore.habits = data.habits.map((h: any) => ({
          ...h,
          createdAt: h.createdAt ? new Date(h.createdAt) : new Date(),
          updatedAt: h.updatedAt ? new Date(h.updatedAt) : new Date(),
        }))
      } else {
        this.habitStore.habits = []
      }

      // Tasks
      if (Array.isArray(data.tasks)) {
        this.taskStore.tasks = data.tasks.map((t: any) => ({
          ...t,
          deadline: t.deadline ? new Date(t.deadline) : undefined,
          createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
        }))
      } else {
        this.taskStore.tasks = []
      }

      // Goals
      if (Array.isArray(data.goals)) {
        this.taskStore.goals = data.goals.map((g: any) => ({
          ...g,
          targetDate: g.targetDate ? new Date(g.targetDate) : new Date(),
          createdAt: g.createdAt ? new Date(g.createdAt) : new Date(),
        }))
      } else {
        this.taskStore.goals = []
      }

      // Notification settings
      if (data.notificationSettings) {
        const ns = data.notificationSettings
        this.notificationStore.enabled = ns.enabled ?? true
        this.notificationStore.dailyReminders = ns.dailyReminders ?? true
        this.notificationStore.weeklyReports = ns.weeklyReports ?? true
        this.notificationStore.reminderTime = ns.reminderTime ?? "09:00"
      } else {
        this.notificationStore.enabled = true
        this.notificationStore.dailyReminders = true
        this.notificationStore.weeklyReports = true
        this.notificationStore.reminderTime = "09:00"
      }

      // Progress
      this.progressStore.progressData = data.progressData ?? {}

      // App settings
      if (data.settings) {
        this.settingsStore.theme = data.settings.theme ?? "light"
        this.settingsStore.language = data.settings.language ?? "ru"
        this.settingsStore.notificationsEnabled = data.settings.notificationsEnabled ?? true
        this.settingsStore.vibrationEnabled = data.settings.vibrationEnabled ?? true
        this.settingsStore.soundEnabled = data.settings.soundEnabled ?? true
      } else {
        this.settingsStore.theme = "light"
        this.settingsStore.language = "ru"
        this.settingsStore.notificationsEnabled = true
        this.settingsStore.vibrationEnabled = true
        this.settingsStore.soundEnabled = true
      }
    } catch (error) {
      console.warn("Нет сохранённых данных RootStore или ошибка парсинга:", error)
    }
  }

  // Сохранение всех данных в AsyncStorage
  async saveAll() {
    try {
      const snapshot = {
        habits: this.habitStore.habits,
        tasks: this.taskStore.tasks,
        goals: this.taskStore.goals,
        notificationSettings: {
          enabled: this.notificationStore.enabled,
          dailyReminders: this.notificationStore.dailyReminders,
          weeklyReports: this.notificationStore.weeklyReports,
          reminderTime: this.notificationStore.reminderTime,
        },
        progressData: this.progressStore.progressData,
        settings: {
          theme: this.settingsStore.theme,
          language: this.settingsStore.language,
          notificationsEnabled: this.settingsStore.notificationsEnabled,
          vibrationEnabled: this.settingsStore.vibrationEnabled,
          soundEnabled: this.settingsStore.soundEnabled,
        },
      }
      await save(ROOT_STORAGE_KEY, snapshot)
    } catch (error) {
      console.error("Ошибка сохранения RootStore:", error)
    }
  }

  // Общая статистика
  get globalStats() {
    const habitCount = this.habitStore.habits.length
    const completedHabits = this.habitStore.habits.filter((h: any) => h.completed > 0).length

    const taskStats = this.taskStore.getProductivityStats()
    return {
      habitsTotal: habitCount,
      habitsCompleted: completedHabits,
      tasksTotal: taskStats.totalTasks,
      tasksCompleted: taskStats.completedTasks,
      goalsTotal: taskStats.totalGoals,
      goalsCompleted: taskStats.completedGoals,
      taskCompletionRate: taskStats.taskCompletionRate,
      goalCompletionRate: taskStats.goalCompletionRate,
    }
  }
}

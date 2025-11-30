import { makeAutoObservable, runInAction } from "mobx"
import * as Notifications from "expo-notifications"
import { Platform } from "react-native"

export class NotificationStore {
  rootStore: any
  enabled = true
  dailyReminders = true
  weeklyReports = true
  reminderTime = "09:00" // формат HH:mm

  constructor(rootStore: any) {
    this.rootStore = rootStore
    makeAutoObservable(this)
  }

  /** Инициализация каналов и разрешений */
  async init() {
    const settings = await Notifications.getPermissionsAsync()
    if (!settings.granted) {
      await Notifications.requestPermissionsAsync()
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("habit-reminders", {
        name: "Habit Reminders",
        importance: Notifications.AndroidImportance.HIGH,
        sound: "default",
      })
    }

    if (this.enabled && this.dailyReminders) {
      await this.scheduleDailyReminder()
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
    if (enabled) {
      this.scheduleDailyReminder()
    } else {
      this.cancelDailyReminder()
    }
  }

  setDailyReminders(enabled: boolean) {
    this.dailyReminders = enabled
    if (enabled && this.enabled) {
      this.scheduleDailyReminder()
    } else {
      this.cancelDailyReminder()
    }
  }

  setWeeklyReports(enabled: boolean) {
    this.weeklyReports = enabled
    // Здесь можно добавить логику для еженедельных отчётов
  }

  setReminderTime(time: string) {
    this.reminderTime = time
    if (this.enabled && this.dailyReminders) {
      this.scheduleDailyReminder()
    }
  }

  /** Планирование глобального ежедневного напоминания */
  async scheduleDailyReminder() {
    const [hh, mm] = this.reminderTime.split(":").map(n => parseInt(n, 10))

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Напоминание о привычках",
        body: "Не забудьте отметить свои привычки сегодня!",
        sound: "default",
      },
      trigger: {
        hour: hh,
        minute: mm,
        repeats: true,
        channelId: "habit-reminders",
      },
    })
  }

  /** Отмена всех глобальных напоминаний */
  async cancelDailyReminder() {
    await Notifications.cancelAllScheduledNotificationsAsync()
  }

  /** Сброс к дефолтным настройкам */
  clearNotifications() {
    runInAction(() => {
      this.enabled = true
      this.dailyReminders = true
      this.weeklyReports = true
      this.reminderTime = "09:00"
    })
  }
}

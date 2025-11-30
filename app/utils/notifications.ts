import { Platform } from 'react-native'

// На Web мы подключаем заглушки, чтобы не падало приложение
let Notifications: typeof import('expo-notifications')

if (Platform.OS === 'web') {
  Notifications = {
    setNotificationHandler: () => {},
    setNotificationChannelAsync: async () => {},
    getPermissionsAsync: async () => ({ status: 'granted' }),
    requestPermissionsAsync: async () => ({ status: 'granted' }),
    getExpoPushTokenAsync: async () => ({ data: 'web-token-stub' }),
    scheduleNotificationAsync: async () => 'web-notification-id',
    cancelScheduledNotificationAsync: async () => {},
    cancelAllScheduledNotificationsAsync: async () => {},
    getAllScheduledNotificationsAsync: async () => [],
    addNotificationReceivedListener: () => ({ remove: () => {} }),
    addNotificationResponseReceivedListener: () => ({ remove: () => {} }),
    setBadgeCountAsync: async () => {},
    AndroidImportance: { DEFAULT: 3, HIGH: 4 },
    SchedulableTriggerInputTypes: {
      DAILY: 'daily',
      WEEKLY: 'weekly',
      TIME_INTERVAL: 'timeInterval',
    },
  } as any
} else {
  Notifications = require('expo-notifications')
}

// Типы для уведомлений
export interface HabitNotification {
  id: string
  title: string
  reminderTime?: string
  daysOfWeek?: number[] // 0-6, где 0 - воскресенье
}

// Конфигурация обработчика уведомлений
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

// Конфигурация каналов (Android)
export const configureNotificationChannels = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('habit-reminders', {
      name: 'Напоминания о привычках',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    })

    await Notifications.setNotificationChannelAsync('general', {
      name: 'Общие уведомления',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    })
  }
}

// Настройка уведомлений и получение токена
export const setupNotifications = async (): Promise<string | boolean> => {
  try {
    await configureNotificationChannels()

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') {
      console.warn('Разрешение на уведомления не предоставлено')
      return false
    }

    if (Platform.OS !== 'web') {
      const tokenData = await Notifications.getExpoPushTokenAsync()
      console.log('Expo Push Token:', tokenData.data)
      return tokenData.data
    }

    return true
  } catch (error) {
    console.error('Ошибка настройки уведомлений:', error)
    return false
  }
}

// Планирование уведомлений
export const scheduleHabitNotification = async (habit: HabitNotification) => {
  try {
    if (!habit.reminderTime) return null

    const [hours, minutes] = habit.reminderTime.split(':').map(Number)

    if (!habit.daysOfWeek || habit.daysOfWeek.length === 0) {
      const trigger = {
        type: 'daily',
        hour: hours,
        minute: minutes,
      }

      return await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Напоминание о привычке',
          body: `Не забудьте: ${habit.title}`,
          sound: true,
          data: { habitId: habit.id, type: 'habit-reminder' },
        },
        trigger,
      })
    } else {
      const trigger = {
        type: 'weekly',
        hour: hours,
        minute: minutes,
        weekday: habit.daysOfWeek[0] + 1, // Expo использует 1-7
      }

      return await Notifications.scheduleNotificationAsync({
        content: {
          title: '📅 Напоминание о привычке',
          body: `Не забудьте: ${habit.title}`,
          sound: true,
          data: { habitId: habit.id, type: 'habit-reminder' },
        },
        trigger,
      })
    }
  } catch (error) {
    console.error('Ошибка планирования уведомления:', error)
    return null
  }
}

// Отмена уведомлений
export const cancelHabitNotification = async (habitId: string) => {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync()
    let cancelledCount = 0

    for (const n of scheduled) {
      if (n.content.data?.habitId === habitId) {
        await Notifications.cancelScheduledNotificationAsync(n.identifier)
        cancelledCount++
      }
    }

    return cancelledCount
  } catch (error) {
    console.error('Ошибка отмены уведомлений:', error)
    return 0
  }
}

export const cancelAllNotifications = async () => {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync()
    const count = scheduled.length
    await Notifications.cancelAllScheduledNotificationsAsync()
    return count
  } catch (error) {
    console.error('Ошибка отмены всех уведомлений:', error)
    return 0
  }
}

// Слушатели
export const setNotificationReceivedListener = (
  listener: (notification: any) => void
) => Notifications.addNotificationReceivedListener(listener)

export const setNotificationResponseReceivedListener = (
  listener: (response: any) => void
) => Notifications.addNotificationResponseReceivedListener(listener)

export const removeAllNotificationListeners = (subscriptions: any[]) => {
  subscriptions.forEach(sub => sub?.remove?.())
}

// Badge (iOS)
export const setApplicationBadgeCount = async (count: number) => {
  if (Platform.OS === 'ios') {
    try {
      await Notifications.setBadgeCountAsync(count)
    } catch (error) {
      console.error('Ошибка установки значка:', error)
    }
  }
}

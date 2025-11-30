import React, { useState, useEffect } from "react"
import { View, ScrollView, Switch, ViewStyle, Platform } from "react-native"
import { observer } from "mobx-react-lite"
import { useNavigation } from "@react-navigation/native"
import * as Notifications from "expo-notifications"
import { Screen, Text, Button } from "app/components"
import { colors, spacing } from "app/theme"
import { RootStore } from "app/models/RootStore"
import { cancelAllNotifications, setupNotifications } from "app/utils/notifications"

// Создаем экземпляр хранилища
const rootStore = new RootStore()

export const NotificationSettingsScreen = observer(function NotificationSettingsScreen() {
  const navigation = useNavigation()
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [dailyReminders, setDailyReminders] = useState(true)
  const [weeklyReports, setWeeklyReports] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)

  useEffect(() => {
    loadNotificationSettings()
  }, [])

  const loadNotificationSettings = async () => {
    try {
      if (Platform.OS === "web") {
        // Web: используем браузерный Notification API
        const perm = typeof Notification !== "undefined" ? Notification.permission : "denied"
        setNotificationsEnabled(perm === "granted")
        if (perm === "default") setInfoMessage("Разрешите уведомления в браузере при первом включении.")
        if (perm === "denied") setInfoMessage("Уведомления заблокированы в браузере. Разрешите их в настройках сайта.")
        return
      }

      // iOS/Android: Expo Notifications
      let { status } = await Notifications.getPermissionsAsync()
      if (status !== "granted") {
        const req = await Notifications.requestPermissionsAsync()
        status = req.status
      }
      setNotificationsEnabled(status === "granted")
    } catch (error) {
      console.error("Ошибка загрузки настроек уведомлений:", error)
      setNotificationsEnabled(false)
      if (Platform.OS === "web") setInfoMessage("Браузер не поддерживает уведомления или они отключены.")
    }
  }

  const handleNotificationsToggle = async (enabled: boolean) => {
    if (Platform.OS === "web") {
      // Web: управление через Notification API
      setIsLoading(true)
      setInfoMessage(null)
      try {
        if (enabled) {
          if (typeof Notification === "undefined") {
            setNotificationsEnabled(false)
            setInfoMessage("Ваш браузер не поддерживает уведомления.")
            setIsLoading(false)
            return
          }
          const perm = await Notification.requestPermission()
          const granted = perm === "granted"
          setNotificationsEnabled(granted)
          if (!granted) {
            setInfoMessage("Нет доступа к уведомлениям. Разрешите их в настройках сайта.")
          } else {
            setInfoMessage("Уведомления включены в браузере.")
            // Лёгкий тест: моментальный браузерный notification
            try {
              new Notification("Уведомления включены", { body: "Теперь вы будете получать напоминания." })
            } catch {}
          }
        } else {
          // На Web программно отключить нельзя — только через настройки сайта.
          setNotificationsEnabled(false)
          setInfoMessage("Уведомления отключены. Чтобы полностью запретить — измените настройки сайта в браузере.")
        }
      } finally {
        setIsLoading(false)
      }
      return
    }

    // iOS/Android
    if (enabled) {
      setIsLoading(true)
      try {
        const { status } = await Notifications.requestPermissionsAsync()
        if (status !== "granted") {
          setNotificationsEnabled(false)
          setInfoMessage("Нет доступа к уведомлениям.")
          return
        }
        const result = await setupNotifications()
        const success = result !== false
        setNotificationsEnabled(success)
        if (success) {
          setDailyReminders(true)
          setWeeklyReports(true)
          setInfoMessage("Уведомления включены.")
        }
      } catch (error) {
        console.error("Ошибка включения уведомлений:", error)
        setNotificationsEnabled(false)
        setInfoMessage("Не удалось включить уведомления.")
      } finally {
        setIsLoading(false)
      }
    } else {
      setIsLoading(true)
      try {
        await cancelAllNotifications()
        setNotificationsEnabled(false)
        setInfoMessage("Все запланированные уведомления удалены.")
      } catch (error) {
        console.error("Ошибка отключения уведомлений:", error)
        setInfoMessage("Не удалось отключить уведомления.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleTestNotification = async () => {
    try {
      if (Platform.OS === "web") {
        if (typeof Notification === "undefined") {
          setInfoMessage("Ваш браузер не поддерживает уведомления.")
          return
        }
        if (Notification.permission !== "granted") {
          const perm = await Notification.requestPermission()
          if (perm !== "granted") {
            setInfoMessage("Нет доступа к уведомлениям.")
            return
          }
        }
        // Мгновенное тестовое уведомление в браузере
        new Notification("Тестовое уведомление", { body: "Это тестовое уведомление от LifeFlow!" })
        setInfoMessage("Тестовое уведомление отправлено.")
        return
      }

      // iOS/Android — Expo Notifications
      const trigger = { seconds: 2 } as Notifications.TimeIntervalTriggerInput
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Тестовое уведомление",
          body: "Это тестовое уведомление от LifeFlow!",
          sound: true,
        },
        trigger,
      })
      setInfoMessage("Тестовое уведомление отправлено.")
    } catch (error) {
      console.error("Ошибка тестового уведомления:", error)
      setInfoMessage("Не удалось отправить тестовое уведомление.")
    }
  }

  const handleUpdateHabitReminders = async () => {
    try {
      if (!notificationsEnabled) {
        setInfoMessage("Сначала включите уведомления.")
        return
      }

      if (Platform.OS === "web") {
        // На Web нет надёжного планирования повторяющихся нотификаций без сервис-воркера/PWA.
        setInfoMessage("Запланировать ежедневные напоминания в Web можно только в PWA с сервис-воркером.")
        return
      }

      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync()
      for (const notification of scheduledNotifications) {
        if (notification.content?.data && (notification.content.data as any)?.habitId) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier)
        }
      }

      for (const habit of rootStore.habitStore.habits) {
        if (habit.reminderTime && dailyReminders) {
          const [hours, minutes] = habit.reminderTime.split(":").map((n: string) => Number(n))
          const trigger = {
            hour: hours,
            minute: minutes,
            repeats: true,
          } as Notifications.CalendarTriggerInput

          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Напоминание о привычке",
              body: `Не забудьте: ${habit.name}`,
              sound: true,
              data: { habitId: habit.id },
            },
            trigger,
          })
        }
      }
      setInfoMessage("Все напоминания привычек обновлены.")
    } catch (error) {
      console.error("Ошибка обновления напоминаний:", error)
      setInfoMessage("Не удалось обновить напоминания.")
    }
  }

  const handleClearAllNotifications = async () => {
    try {
      if (Platform.OS === "web") {
        setInfoMessage("Очистка запланированных уведомлений недоступна для Web. Измените настройки сайта.")
        return
      }
      await cancelAllNotifications()
      setInfoMessage("Все уведомления очищены.")
    } catch (error) {
      console.error("Ошибка очистки уведомлений:", error)
      setInfoMessage("Не удалось очистить уведомления.")
    }
  }

  const habitsWithReminders = rootStore.habitStore.habits.filter((h: any) => h.reminderTime)

  return (
    <Screen preset="fixed" safeAreaEdges={["top", "bottom"]}>
      <ScrollView style={{ flex: 1, padding: spacing.lg }} showsVerticalScrollIndicator={false}>
        <Text text="Настройки уведомлений" preset="heading" style={{ marginBottom: spacing.xl }} />

        <View style={$section}>
          <View style={$switchRow}>
            <View style={$switchTextContainer}>
              <Text text="Уведомления" preset="subheading" />
              <Text text={Platform.OS === "web" ? "Включить/выключить уведомления браузера" : "Включить/выключить все уведомления"} preset="formHelper" />
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              disabled={isLoading}
              trackColor={{ false: colors.palette.neutral400, true: colors.palette.primary300 }}
              thumbColor={notificationsEnabled ? colors.palette.primary500 : colors.palette.neutral100}
              ios_backgroundColor={colors.palette.neutral400}
            />
          </View>

          {infoMessage ? (
            <View style={{ marginTop: spacing.sm }}>
              <Text text={infoMessage} preset="formHelper" style={{ color: colors.textDim }} />
            </View>
          ) : null}
        </View>

        {notificationsEnabled ? (
          <>
            <View style={$section}>
              <Text text="Типы уведомлений" preset="subheading" style={{ marginBottom: spacing.md }} />
              <View style={$switchRow}>
                <View style={$switchTextContainer}>
                  <Text text="Ежедневные напоминания" preset="bold" />
                  <Text text={Platform.OS === "web" ? "Требуется PWA/Service Worker" : "Напоминания о ваших привычках"} preset="formHelper" />
                </View>
                <Switch value={dailyReminders} onValueChange={setDailyReminders} disabled={Platform.OS === "web"} />
              </View>
              <View style={[$switchRow, { marginTop: spacing.md }]}>
                <View style={$switchTextContainer}>
                  <Text text="Еженедельные отчеты" preset="bold" />
                  <Text text="Статистика за неделю" preset="formHelper" />
                </View>
                <Switch value={weeklyReports} onValueChange={setWeeklyReports} />
              </View>
            </View>

            <View style={$section}>
              <Text text="Действия" preset="subheading" style={{ marginBottom: spacing.md }} />
              <Button text="Отправить тестовое уведомление" onPress={handleTestNotification} style={{ marginBottom: spacing.md }} />
              <Button text="Обновить напоминания привычек" onPress={handleUpdateHabitReminders} style={{ marginBottom: spacing.md }} />
              <Button text="Очистить все уведомления" onPress={handleClearAllNotifications} />
            </View>

            <View style={$section}>
              <Text text="Статистика" preset="subheading" style={{ marginBottom: spacing.md }} />
              <View style={$statsContainer}>
                <View style={$statItem}>
                  <Text text={habitsWithReminders.length.toString()} preset="heading" style={{ color: colors.palette.primary500 }} />
                  <Text text="Привычек с напоминаниями" preset="formHelper" />
                </View>
                <View style={$statItem}>
                  <Text text={rootStore.habitStore.habits.length.toString()} preset="heading" style={{ color: colors.palette.secondary500 }} />
                  <Text text="Всего привычек" preset="formHelper" />
                </View>
              </View>
            </View>
          </>
        ) : (
          <View style={[$section, $disabledSection]}>
            <Text text="🔕 Уведомления отключены" preset="subheading" style={{ textAlign: "center", marginBottom: spacing.sm }} />
            <Text text={Platform.OS === "web" ? "Разрешите уведомления в настройках браузера" : "Включите уведомления, чтобы получать напоминания"} preset="formHelper" style={{ textAlign: "center", color: colors.textDim }} />
          </View>
        )}

        <Button text="Назад" onPress={() => navigation.goBack()} style={{ marginTop: spacing.xl }} />
      </ScrollView>
    </Screen>
  )
})

// ===== Стили =====
const $section: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  padding: spacing.lg,
  borderRadius: 12,
  marginBottom: spacing.lg,
  shadowColor: colors.palette.neutral800,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  elevation: 2,
}

const $disabledSection: ViewStyle = {
  backgroundColor: colors.palette.neutral200,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
}

const $switchRow: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
}

const $switchTextContainer: ViewStyle = {
  flex: 1,
  marginRight: spacing.md,
}

const $statsContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
  marginTop: spacing.sm,
}

const $statItem: ViewStyle = {
  alignItems: "center",
  flex: 1,
  paddingVertical: spacing.sm,
}

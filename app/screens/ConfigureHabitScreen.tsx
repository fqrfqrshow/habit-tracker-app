//app\screens\ConfigureHabitScreen.tsx

import React, { useState, useEffect } from "react"
import { View, TouchableOpacity, TextInput, Switch, Alert, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native"
import { Screen, Text, Button, Icon } from "app/components"
import { colors, spacing } from "../theme"
import { rootStore } from "app/models"

const colorOptions = [
  { name: "Салатовый", value: "#a9ff6b" },
  { name: "Розовый", value: "#ff6bb5" },
  { name: "Жёлтый", value: "#ffe066" },
  { name: "Оранжевый", value: "#ff9f40" },
  { name: "Фиолетовый", value: "#9b59b6" },
  { name: "Голубой", value: "#5dade2" },
  { name: "Зелёный", value: "#2ecc71" },
  { name: "Красный", value: "#e74c3c" },
]

const weekDays = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"]
const weekDaysShort = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]

type ConfigureHabitRouteParams = {
  habitName?: string
  habitColor?: string
}

export const ConfigureHabitScreen = observer(function ConfigureHabitScreen() {
  const navigation = useNavigation()
  const route = useRoute<RouteProp<{ params: ConfigureHabitRouteParams }, "params">>()

  const [name, setName] = useState("")
  const [selectedFrequency, setSelectedFrequency] = useState("Каждый день")
  const [frequency, setFrequency] = useState<string[]>(weekDays)
  const [duration, setDuration] = useState("Бессрочно")
  const [customValue, setCustomValue] = useState("")
  const [customUnit, setCustomUnit] = useState<"недели" | "месяцы">("недели")
  const [color, setColor] = useState(colorOptions[0].value)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [notificationDays, setNotificationDays] = useState<string[]>([])
  const [notificationTime, setNotificationTime] = useState("20:00")

  useEffect(() => {
    if (route.params?.habitName) setName(route.params.habitName)
    if (route.params?.habitColor) setColor(route.params.habitColor)
  }, [route.params])

  const getFrequencyArray = (freqText: string): string[] => {
    switch (freqText) {
      case "Каждый день":
        return weekDays
      case "1 раз в неделю":
        return [weekDays[0]] // Понедельник
      case "2 раза в неделю":
        return [weekDays[0], weekDays[3]] // Пн, Чт
      case "3 раза в неделю":
        return [weekDays[0], weekDays[2], weekDays[4]] // Пн, Ср, Пт
      case "4 раза в неделю":
        return [weekDays[0], weekDays[1], weekDays[3], weekDays[5]] // Пн, Вт, Чт, Сб
      case "5 раз в неделю":
        return [weekDays[0], weekDays[1], weekDays[2], weekDays[3], weekDays[4]] // Пн-Пт
      case "6 раз в неделю":
        return [weekDays[0], weekDays[1], weekDays[2], weekDays[3], weekDays[4], weekDays[5]] // Пн-Сб
      default:
        return []
    }
  }

  const handleFrequencySelect = (freqText: string) => {
    setSelectedFrequency(freqText)
    if (freqText !== "Каждый день") {
      setFrequency(getFrequencyArray(freqText))
    } else {
      setFrequency(weekDays)
    }
  }

  const toggleNotificationDay = (day: string) => {
  setNotificationDays((prev: string[]) => 
    prev.includes(day) ? prev.filter((d: string) => d !== day) : [...prev, day]
  )
}

  const toggleHabitDay = (day: string) => {
  setFrequency((prev: string[]) => {
    const newFrequency = prev.includes(day) ? prev.filter((d: string) => d !== day) : [...prev, day]
    
    // Обновляем selectedFrequency если пользователь изменяет дни вручную
    if (newFrequency.length > 0 && newFrequency.length < 7) {
      setSelectedFrequency("Своя")
    }
    
    return newFrequency
  })
}

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert("Ошибка", "Введите название привычки")
      return false
    }
    if (frequency.length === 0) {
      Alert.alert("Ошибка", "Выберите дни для привычки")
      return false
    }
    if (duration === "Своя" && (!customValue || isNaN(Number(customValue)) || Number(customValue) <= 0)) {
      Alert.alert("Ошибка", "Введите корректное значение для длительности")
      return false
    }
    if (notificationsEnabled && notificationDays.length === 0) {
      Alert.alert("Ошибка", "Выберите дни для уведомлений")
      return false
    }
    if (notificationsEnabled && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(notificationTime)) {
      Alert.alert("Ошибка", "Введите корректное время в формате HH:MM")
      return false
    }
    return true
  }

  const calculateDurationInDays = (): number => {
    switch (duration) {
      case "Бессрочно":
        return 0 // 0 означает бессрочно
      case "2 недели":
        return 14
      case "1 месяц":
        return 30
      case "2 месяца":
        return 60
      case "3 месяца":
        return 90
      case "Своя":
        const value = parseInt(customValue) || 0
        return customUnit === "недели" ? value * 7 : value * 30
      default:
        return 0
    }
  }

  const convertDaysToWeekDays = (days: string[]): string[] => {
  const dayMap: { [key: string]: string } = {
    "Понедельник": "monday",
    "Вторник": "tuesday", 
    "Среда": "wednesday",
    "Четверг": "thursday",
    "Пятница": "friday",
    "Суббота": "saturday",
    "Воскресенье": "sunday",
  }
  return days.map(day => dayMap[day]).filter((day): day is string => day !== undefined)
}

  const handleSave = async () => {
    if (!validateForm()) return

    try {
      const goal = frequency.length
      const durationInDays = calculateDurationInDays()
      const daysOfWeek = convertDaysToWeekDays(frequency)
      const notificationDaysFormatted = convertDaysToWeekDays(notificationDays)

      const habitData = {
        name: name.trim(),
        description: "",
        category: "personal",
        frequency: daysOfWeek,
        goal,
        reminderTime: notificationsEnabled ? notificationTime : undefined,
        color,
        emoji: "⭐", // Дефолтная иконка
        time: durationInDays > 0 ? `${durationInDays} дней` : "forever",
        notificationDays: notificationsEnabled ? notificationDaysFormatted : [],
      }

      await rootStore.habitStore.createHabit(habitData)

      Alert.alert("Успех", "Привычка создана!")
      navigation.navigate("Main" as never)
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось создать привычку")
      console.error(error)
    }
  }

  const getLightColor = (hex: string): string => hex + "20"

  const frequencyOptions = [
    "Каждый день",
    "1 раз в неделю",
    "2 раза в неделю",
    "3 раза в неделю",
    "4 раза в неделю",
    "5 раз в неделю",
    "6 раз в неделю",
  ]

  return (
    <Screen preset="scroll" safeAreaEdges={["top", "bottom"]} style={{ backgroundColor: getLightColor(color) }}>
      <View style={{ padding: spacing.md }}>
        <View style={[$headerContainer, { backgroundColor: getLightColor(color) }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon icon="back" color={colors.text} />
          </TouchableOpacity>
          <Text text="Настройка привычки" preset="heading" size="lg" />
        </View>

        {/* Название */}
        <View style={$sectionContainer}>
          <Text text="Название *" preset="subheading" style={{ marginBottom: spacing.xs }} />
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Введите название привычки"
            style={[$input, { borderColor: color }]}
            placeholderTextColor={colors.palette.neutral500}
          />
        </View>

        {/* Периодичность и выбор дней */}
        <View style={$sectionContainer}>
          <Text text="Периодичность *" preset="subheading" style={{ marginBottom: spacing.xs }} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {frequencyOptions.map(opt => (
              <TouchableOpacity
                key={opt}
                onPress={() => handleFrequencySelect(opt)}
                style={[
                  $optionButton,
                  {
                    backgroundColor: selectedFrequency === opt ? color : colors.palette.neutral200,
                    borderColor: selectedFrequency === opt ? color : colors.palette.neutral300,
                  },
                ]}
              >
                <Text
                  text={opt}
                  style={{
                    color: selectedFrequency === opt ? colors.palette.neutral100 : colors.textDim,
                    fontSize: 12,
                  }}
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: spacing.sm }}>
            {weekDays.map((day, index) => (
              <TouchableOpacity
                key={day}
                onPress={() => toggleHabitDay(day)}
                style={[
                  $optionButton,
                  {
                    backgroundColor: frequency.includes(day) ? color : colors.palette.neutral200,
                    borderColor: frequency.includes(day) ? color : colors.palette.neutral300,
                  },
                ]}
              >
                <Text
                  text={weekDaysShort[index]}
                  style={{
                    color: frequency.includes(day) ? colors.palette.neutral100 : colors.textDim,
                    fontSize: 12,
                  }}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text
            text={`Выбрано дней: ${frequency.length}`}
            style={{ marginTop: spacing.xs, color: colors.textDim, fontSize: 12 }}
          />
        </View>

        {/* Длительность */}
        <View style={$sectionContainer}>
          <Text text="Длительность" preset="subheading" style={{ marginBottom: spacing.xs }} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {["Бессрочно", "2 недели", "1 месяц", "2 месяца", "3 месяца", "Своя"].map(opt => (
              <TouchableOpacity
                key={opt}
                onPress={() => setDuration(opt)}
                style={[
                  $optionButton,
                  {
                    backgroundColor: duration === opt ? color : colors.palette.neutral200,
                    borderColor: duration === opt ? color : colors.palette.neutral300,
                  },
                ]}
              >
                <Text
                  text={opt}
                  style={{
                    color: duration === opt ? colors.palette.neutral100 : colors.textDim,
                    fontSize: 12,
                  }}
                />
              </TouchableOpacity>
            ))}
          </View>

          {duration === "Своя" && (
            <View style={{ flexDirection: "row", marginTop: spacing.sm, gap: spacing.sm, alignItems: "center" }}>
              <TextInput
                placeholder="Введите число"
                value={customValue}
                onChangeText={setCustomValue}
                keyboardType="numeric"
                style={[$input, { width: 80, borderColor: color }]}
                placeholderTextColor={colors.palette.neutral500}
              />
              <TouchableOpacity
                onPress={() => setCustomUnit("недели")}
                style={[
                  $optionButton,
                  {
                    backgroundColor: customUnit === "недели" ? color : colors.palette.neutral200,
                    borderColor: customUnit === "недели" ? color : colors.palette.neutral300,
                  },
                ]}
              >
                <Text
                  text="недели"
                  style={{
                    color: customUnit === "недели" ? colors.palette.neutral100 : colors.textDim,
                    fontSize: 12,
                  }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setCustomUnit("месяцы")}
                style={[
                  $optionButton,
                  {
                    backgroundColor: customUnit === "месяцы" ? color : colors.palette.neutral200,
                    borderColor: customUnit === "месяцы" ? color : colors.palette.neutral300,
                  },
                ]}
              >
                <Text
                  text="месяцы"
                  style={{
                    color: customUnit === "месяцы" ? colors.palette.neutral100 : colors.textDim,
                    fontSize: 12,
                  }}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Цвет */}
        <View style={$sectionContainer}>
          <Text text="Цвет оформления" preset="subheading" style={{ marginBottom: spacing.xs }} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {colorOptions.map(opt => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setColor(opt.value)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: opt.value,
                  borderWidth: color === opt.value ? 3 : 1,
                  borderColor: color === opt.value ? colors.palette.neutral700 : colors.palette.neutral300,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {color === opt.value && <Icon icon="check" color={colors.palette.neutral100} size={20} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Уведомления */}
        <View style={$sectionContainer}>
          <Text text="Уведомления" preset="subheading" style={{ marginBottom: spacing.xs }} />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.palette.neutral300, true: color }}
              thumbColor={notificationsEnabled ? colors.palette.neutral100 : colors.palette.neutral400}
            />
            <Text text={notificationsEnabled ? "Включены" : "Выключены"} />
          </View>

          {notificationsEnabled && (
            <View style={{ marginTop: spacing.sm }}>
              <Text text="Дни уведомлений *" style={{ marginBottom: spacing.xs }} />
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginVertical: 8 }}>
                {weekDays.map((day, index) => (
                  <TouchableOpacity
                    key={day}
                    onPress={() => toggleNotificationDay(day)}
                    style={[
                      $optionButton,
                      {
                        backgroundColor: notificationDays.includes(day) ? color : colors.palette.neutral200,
                        borderColor: notificationDays.includes(day) ? color : colors.palette.neutral300,
                      },
                    ]}
                  >
                    <Text
                      text={weekDaysShort[index]}
                      style={{
                        color: notificationDays.includes(day) ? colors.palette.neutral100 : colors.textDim,
                        fontSize: 12,
                      }}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <Text text="Время уведомления *" style={{ marginBottom: spacing.xs }} />
              <TextInput
                value={notificationTime}
                onChangeText={setNotificationTime}
                placeholder="HH:MM"
                style={[$input, { width: 100, borderColor: color }]}
                placeholderTextColor={colors.palette.neutral500}
              />
            </View>
          )}
        </View>

        {/* Кнопки */}
        <View style={$buttonContainer}>
          <Button
            text="Назад"
            onPress={() => navigation.goBack()}
            style={[$backButton, { backgroundColor: colors.palette.neutral300 }]}
            preset="reversed"
          />
          <Button
            text="Сохранить"
            onPress={handleSave}
            style={[$saveButton, { backgroundColor: color }]}
            disabled={!name.trim() || frequency.length === 0}
          />
        </View>

        <Text
          text="* - обязательные поля"
          style={{
            marginTop: spacing.md,
            color: colors.textDim,
            fontSize: 12,
            textAlign: "center",
            fontStyle: "italic",
          }}
        />
      </View>
    </Screen>
  )
})

const $headerContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 16,
  marginBottom: spacing.md,
  paddingVertical: spacing.sm,
  borderRadius: spacing.xs,
}

const $sectionContainer: ViewStyle = {
  marginBottom: spacing.lg,
  padding: spacing.md,
  backgroundColor: colors.palette.neutral100,
  borderRadius: spacing.xs,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
}

const $input: ViewStyle = {
  borderWidth: 1,
  padding: spacing.sm,
  borderRadius: 8,
  backgroundColor: colors.palette.neutral100,
}

const $optionButton: ViewStyle = {
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 20,
  borderWidth: 1,
}

const $buttonContainer: ViewStyle = {
  flexDirection: "row",
  gap: spacing.md,
  marginTop: spacing.lg,
}

const $backButton: ViewStyle = {
  flex: 1,
  borderWidth: 0,
  borderRadius: spacing.xs,
}

const $saveButton: ViewStyle = {
  flex: 2,
  borderWidth: 0,
  borderRadius: spacing.xs,
}
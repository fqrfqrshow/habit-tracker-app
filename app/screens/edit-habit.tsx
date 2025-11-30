import { observer } from "mobx-react-lite"
import React, { FC, useEffect, useState } from "react"
import { View, ViewStyle, ScrollView, Alert } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { Text, Screen, TextField, Button } from "app/components"
import { spacing } from "../theme"
import { EditHabitScreenProps } from "../navigators/types"
import { rootStore } from "app/models"
import type { HabitType } from "app/models/HabitStore"   // ✅ используем тип из HabitStore

export const EditHabitScreen: FC<EditHabitScreenProps> = observer(function EditHabitScreen({ navigation, route }) {
  const { habitId } = route.params

  const [loading, setLoading] = useState(true)
  const [habit, setHabit] = useState<HabitType | null>(null)
  const [name, setName] = useState("")
  const [time, setTime] = useState("")
  const [emoji, setEmoji] = useState("")

  useEffect(() => {
    loadHabit()
  }, [habitId])

  const loadHabit = async () => {
    try {
      setLoading(true)

      // 1) Пытаемся взять из стора
      const storeHabits = rootStore?.habitStore?.habits ?? []
      const foundInStore = storeHabits.find((h) => String(h.id) === String(habitId))
      if (foundInStore) {
        setHabit(foundInStore)
        setName(foundInStore.name ?? "")
        setTime(foundInStore.time ?? "")
        setEmoji(foundInStore.emoji ?? "")
        setLoading(false)
        return
      }

      // 2) Фолбэк: читаем из AsyncStorage
      const raw = await AsyncStorage.getItem("user_habits")
      if (raw) {
        const habits: HabitType[] = JSON.parse(raw)
        const found = habits.find((h) => String(h.id) === String(habitId))
        if (found) {
          setHabit(found)
          setName(found.name ?? "")
          setTime(found.time ?? "")
          setEmoji(found.emoji ?? "")
        }
      }

      setLoading(false)
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось загрузить привычку")
      setLoading(false)
    }
  }

  const saveHabit = async () => {
    try {
      // Обновляем в сторе
      const storeHabits = rootStore?.habitStore?.habits ?? []
      const idx = storeHabits.findIndex((h) => String(h.id) === String(habitId))
      if (idx >= 0) {
        const updated = { ...storeHabits[idx], name, time, emoji }
        rootStore.habitStore.habits[idx] = updated
      }

      // Обновляем AsyncStorage
      const raw = await AsyncStorage.getItem("user_habits")
      const habits: HabitType[] = raw ? JSON.parse(raw) : []
      const updatedAsync = habits.map((h) =>
        String(h.id) === String(habitId) ? { ...h, name, time, emoji } : h,
      )
      await AsyncStorage.setItem("user_habits", JSON.stringify(updatedAsync))

      // Сохраняем снапшот стора
      if (rootStore?.saveAll) {
        await rootStore.saveAll()
      }

      Alert.alert("Успех", "Изменения сохранены")
      navigation.goBack()
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось сохранить изменения")
    }
  }

  if (loading) {
    return (
      <Screen preset="fixed" safeAreaEdges={["top", "bottom"]} contentContainerStyle={$loadingContainer}>
        <Text text="Загрузка..." />
      </Screen>
    )
  }

  if (!habit) {
    return (
      <Screen preset="scroll" safeAreaEdges={["top", "bottom"]} contentContainerStyle={$container}>
        <Text text="Привычка не найдена" preset="heading" />
        <Button text="Назад" onPress={() => navigation.goBack()} style={$saveButton} />
      </Screen>
    )
  }

  return (
    <Screen preset="scroll" safeAreaEdges={["top", "bottom"]} contentContainerStyle={$container}>
      <ScrollView contentContainerStyle={$scrollContent}>
        <Text text="Редактировать привычку" preset="heading" />

        <View style={$fieldContainer}>
          <Text preset="formLabel" text="Название привычки" />
          <TextField value={name} onChangeText={setName} placeholder="Введите название" />
        </View>

        <View style={$fieldContainer}>
          <Text preset="formLabel" text="Эмодзи" />
          <TextField value={emoji} onChangeText={setEmoji} placeholder="🏃" />
        </View>

        <View style={$fieldContainer}>
          <Text preset="formLabel" text="Время" />
          <TextField value={time} onChangeText={setTime} placeholder="08:00" />
        </View>

        <Button text="Сохранить изменения" onPress={saveHabit} style={$saveButton} />
      </ScrollView>
    </Screen>
  )
})

const $loadingContainer: ViewStyle = { padding: spacing.md, gap: spacing.sm }
const $container: ViewStyle = { padding: spacing.md, paddingBottom: spacing.xl }
const $scrollContent: ViewStyle = { gap: spacing.lg, paddingBottom: 100 }
const $fieldContainer: ViewStyle = { gap: spacing.xs, marginBottom: spacing.md }
const $saveButton: ViewStyle = { marginTop: spacing.md }

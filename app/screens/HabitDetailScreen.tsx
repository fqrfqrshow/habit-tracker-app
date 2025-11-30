// app/screens/HabitDetailScreen.tsx
import { observer } from "mobx-react-lite"
import React, { useState, useEffect } from "react"
import { 
  View, 
  ViewStyle, 
  TouchableOpacity, 
  TextStyle, 
  Alert,
  ActivityIndicator
} from "react-native"
import { Text, Screen, Button } from "app/components"
import { colors, spacing } from "app/theme"
import { RouteProp, useRoute } from "@react-navigation/native"

// Временные заглушки для типов и функций
interface Habit {
  id: string
  title: string
  description?: string
  targetDuration?: number
  frequency?: string[]
  reminderTime?: string
}

interface HabitCompletion {
  id: string
  habitId: string
  date: string
  completed: boolean
}

// Временная заглушка для хранилища
const useMockStores = () => {
  const mockHabit: Habit = {
    id: "1",
    title: "Бег",
    description: "Ежедневная пробежка",
    targetDuration: 30,
    frequency: ["mon", "tue", "wed", "thu", "fri"],
    reminderTime: "08:00"
  }

  const mockCompletions: HabitCompletion[] = [
    { id: "1", habitId: "1", date: "2024-01-15", completed: true },
    { id: "2", habitId: "1", date: "2024-01-14", completed: true },
    { id: "3", habitId: "1", date: "2024-01-13", completed: false },
  ]

  return {
    habitStore: {
      getHabitById: (id: string): Habit | undefined => {
        return id === "1" ? mockHabit : undefined
      },
      getCompletionsForHabit: (habitId: string): HabitCompletion[] => {
        return habitId === "1" ? mockCompletions : []
      },
      toggleHabitCompletion: async (habitId: string, date: Date) => {
        console.log("Toggle completion:", habitId, date)
        // Реальная логика будет в хранилище
      }
    }
  }
}

export const HabitDetailScreen = observer(function HabitDetailScreen() {
  const { habitStore } = useMockStores() // Используем заглушку вместо useStores
  const route = useRoute<RouteProp<{ params: { habitId: string } }>>()
  const { habitId } = route.params
  
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week')
  const [loading, setLoading] = useState(false)

  const habit = habitStore.getHabitById(habitId)

  useEffect(() => {
    if (!habit) {
      Alert.alert("Ошибка", "Привычка не найдена")
    }
  }, [habit])

  if (!habit) {
    return (
      <Screen preset="fixed">
        <View style={$centerContainer}>
          <Text text="Привычка не найдена" />
        </View>
      </Screen>
    )
  }

  const handleCompleteHabit = async () => {
    setLoading(true)
    try {
      await habitStore.toggleHabitCompletion(habit.id, new Date())
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось обновить привычку")
    } finally {
      setLoading(false)
    }
  }

  const getActivityData = () => {
    // Заглушка для данных активности
    return Array.from({ length: selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 365 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      completed: Math.random() > 0.5
    }))
  }

  const calculateStats = () => {
    const completions = habitStore.getCompletionsForHabit(habit.id)
    const totalDays = 30 // Пример: за последние 30 дней
    const completedDays = completions.filter((completion: HabitCompletion) => completion.completed).length
    const successRate = Math.round((completedDays / totalDays) * 100)
    
    // Расчет серий
    let currentStreak = 0
    let bestStreak = 0
    let tempStreak = 0
    
    const sortedCompletions = [...completions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    
    for (const completion of sortedCompletions) {
      if (completion.completed) {
        tempStreak++
        currentStreak = tempStreak
        bestStreak = Math.max(bestStreak, tempStreak)
      } else {
        tempStreak = 0
      }
    }

    return {
      successRate,
      currentStreak,
      bestStreak,
      totalCompletions: completedDays
    }
  }

  const stats = calculateStats()
  const activityData = getActivityData()

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]}>
      {/* Шапка */}
      <View style={$header}>
        <View style={$headerTop}>
          <Text text={habit.title} preset="heading" />
          <View style={$completionIndicator}>
            <Text 
              text={`${stats.successRate}%`} 
              preset="bold" 
              style={{ color: colors.palette.primary600 }} 
            />
          </View>
        </View>
        <Text 
          text={`Вы справляетесь с целью на ${stats.successRate}%`} 
          size="sm" 
          style={{ color: colors.textDim, marginTop: spacing.xs }} 
        />
      </View>

      {/* Кнопка выполнения */}
      <View style={$completeSection}>
        <Button
          text={loading ? "..." : "Отметить выполнение"}
          onPress={handleCompleteHabit}
          style={$completeButton}
          disabled={loading}
          LeftAccessory={() => loading && 
            <ActivityIndicator color={colors.palette.neutral100} style={{ marginRight: spacing.xs }} />
          }
        />
      </View>

      {/* Статистика */}
      <View style={$statsSection}>
        <Text text="Статистика" preset="subheading" style={{ marginBottom: spacing.md }} />
        <View style={$statsGrid}>
          <View style={$statItem}>
            <Text text={stats.currentStreak.toString()} preset="heading" size="lg" />
            <Text text="Текущая серия" size="xs" style={{ color: colors.textDim }} />
          </View>
          <View style={$statItem}>
            <Text text={stats.bestStreak.toString()} preset="heading" size="lg" />
            <Text text="Лучшая серия" size="xs" style={{ color: colors.textDim }} />
          </View>
          <View style={$statItem}>
            <Text text={stats.totalCompletions.toString()} preset="heading" size="lg" />
            <Text text="Всего выполнено" size="xs" style={{ color: colors.textDim }} />
          </View>
        </View>
      </View>

      {/* Периоды активности */}
      <View style={$periodSection}>
        <Text text="Активность" preset="subheading" style={{ marginBottom: spacing.md }} />
        <View style={$periodSelector}>
          <TouchableOpacity 
            style={[
              $periodButton,
              selectedPeriod === 'week' && $periodButtonActive
            ]}
            onPress={() => setSelectedPeriod('week')}
          >
            <Text 
              text="Неделя" 
              style={[
                $periodButtonText,
                selectedPeriod === 'week' && $periodButtonTextActive
              ]} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              $periodButton,
              selectedPeriod === 'month' && $periodButtonActive
            ]}
            onPress={() => setSelectedPeriod('month')}
          >
            <Text 
              text="Месяц" 
              style={[
                $periodButtonText,
                selectedPeriod === 'month' && $periodButtonTextActive
              ]} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              $periodButton,
              selectedPeriod === 'year' && $periodButtonActive
            ]}
            onPress={() => setSelectedPeriod('year')}
          >
            <Text 
              text="Год" 
              style={[
                $periodButtonText,
                selectedPeriod === 'year' && $periodButtonTextActive
              ]} 
            />
          </TouchableOpacity>
        </View>

        {/* Календарь активности */}
        <View style={$activityCalendar}>
          {activityData.map((day, index) => (
            <View 
              key={index} 
              style={[
                $activityDay,
                day.completed && $activityDayCompleted,
                !day.completed && $activityDayMissed
              ]} 
            />
          ))}
        </View>
        
        <View style={$activityLegend}>
          <View style={$legendItem}>
            <View style={[$legendColor, $activityDayCompleted]} />
            <Text text="Выполнено" size="xs" style={{ color: colors.textDim }} />
          </View>
          <View style={$legendItem}>
            <View style={[$legendColor, $activityDayMissed]} />
            <Text text="Пропущено" size="xs" style={{ color: colors.textDim }} />
          </View>
        </View>
      </View>

      {/* Детали привычки */}
      <View style={$detailsSection}>
        <Text text="Детали привычки" preset="subheading" style={{ marginBottom: spacing.md }} />
        <View style={$detailItem}>
          <Text text="Описание:" preset="formLabel" size="sm" />
          <Text text={habit.description || "Нет описания"} style={{ color: colors.textDim }} />
        </View>
        {habit.targetDuration && (
          <View style={$detailItem}>
            <Text text="Цель:" preset="formLabel" size="sm" />
            <Text text={`${habit.targetDuration} минут`} style={{ color: colors.textDim }} />
          </View>
        )}
        <View style={$detailItem}>
          <Text text="Дни повторения:" preset="formLabel" size="sm" />
          <Text 
            text={habit.frequency?.map((day: string) => 
              day === 'mon' ? 'Пн' :
              day === 'tue' ? 'Вт' :
              day === 'wed' ? 'Ср' :
              day === 'thu' ? 'Чт' :
              day === 'fri' ? 'Пт' :
              day === 'sat' ? 'Сб' : 'Вс'
            ).join(', ') || 'Ежедневно'} 
            style={{ color: colors.textDim }} 
          />
        </View>
        {habit.reminderTime && (
          <View style={$detailItem}>
            <Text text="Напоминание:" preset="formLabel" size="sm" />
            <Text text={`${habit.reminderTime}`} style={{ color: colors.textDim }} />
          </View>
        )}
      </View>
    </Screen>
  )
})

// Стили
const $header: ViewStyle = {
  padding: spacing.lg,
  backgroundColor: colors.palette.neutral100,
  borderBottomWidth: 1,
  borderBottomColor: colors.palette.neutral300,
}

const $headerTop: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
}

const $completionIndicator: ViewStyle = {
  backgroundColor: colors.palette.neutral200,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
  borderRadius: 16,
}

const $completeSection: ViewStyle = {
  padding: spacing.lg,
}

const $completeButton: ViewStyle = {
  backgroundColor: colors.palette.primary600,
}

const $statsSection: ViewStyle = {
  padding: spacing.lg,
  backgroundColor: colors.palette.neutral100,
  marginHorizontal: spacing.lg,
  borderRadius: spacing.md,
  marginBottom: spacing.lg,
}

const $statsGrid: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
}

const $statItem: ViewStyle = {
  alignItems: "center",
  flex: 1,
}

const $periodSection: ViewStyle = {
  padding: spacing.lg,
}

const $periodSelector: ViewStyle = {
  flexDirection: "row",
  backgroundColor: colors.palette.neutral200,
  borderRadius: spacing.sm,
  padding: 2,
  marginBottom: spacing.lg,
}

const $periodButton: ViewStyle = {
  flex: 1,
  paddingVertical: spacing.sm,
  alignItems: "center",
  borderRadius: spacing.sm - 2,
}

const $periodButtonActive: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
}

const $periodButtonText: TextStyle = {
  color: colors.textDim,
  fontWeight: "500",
}

const $periodButtonTextActive: TextStyle = {
  color: colors.text,
}

const $activityCalendar: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 4,
  marginBottom: spacing.md,
  justifyContent: "center",
}

const $activityDay: ViewStyle = {
  width: 12,
  height: 12,
  borderRadius: 2,
}

const $activityDayCompleted: ViewStyle = {
  backgroundColor: colors.palette.primary600,
}

const $activityDayMissed: ViewStyle = {
  backgroundColor: colors.palette.neutral300,
}

const $activityLegend: ViewStyle = {
  flexDirection: "row",
  justifyContent: "center",
  gap: spacing.lg,
}

const $legendItem: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
}

const $legendColor: ViewStyle = {
  width: 8,
  height: 8,
  borderRadius: 1,
}

const $detailsSection: ViewStyle = {
  padding: spacing.lg,
  backgroundColor: colors.palette.neutral100,
  margin: spacing.lg,
  borderRadius: spacing.md,
}

const $detailItem: ViewStyle = {
  marginBottom: spacing.md,
}

const $centerContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  padding: spacing.lg,
}
import { observer } from "mobx-react-lite"
import React, { FC } from "react"
import { TextStyle, View, ViewStyle, TouchableOpacity } from "react-native"
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import { Text, Screen } from "app/components"
import layout from "app/utils/layout"

import { colors, spacing } from "../theme"
import { StatisticsScreenProps } from "app/navigators/types"
import { rootStore } from "app/models"
import { HabitType } from "app/models/HabitStore"

const filters = [
  { title: "День", abbr: "Д", id: 1 },
  { title: "Неделя", abbr: "Н", id: 2 },
  { title: "Месяц", abbr: "М", id: 3 },
  { title: "3 месяца", abbr: "3М", id: 4 },
  { title: "6 месяцев", abbr: "6М", id: 5 },
  { title: "Год", abbr: "Г", id: 6 },
]

// Заглушки для графиков вместо react-native-gifted-charts
const BarChart = ({ data, width, height, ...props }: any) => {
  const maxValue = Math.max(...data.map((item: any) => item.value), 1)
  
  return (
    <View style={[$barChartContainer, { width, height }]}>
      <View style={$barsContainer}>
        {data.map((item: any, index: number) => (
          <View key={index} style={$barColumn}>
            <View 
              style={[
                $bar, 
                { 
                  height: `${(item.value / maxValue) * 80}%`,
                  backgroundColor: item.frontColor || colors.palette.primary600 
                }
              ]} 
            />
            <Text text={item.label} size="xs" style={$barLabel} />
          </View>
        ))}
      </View>
    </View>
  )
}

const PieChart = ({ data, radius = 70, innerRadius = 50, centerLabelComponent, ...props }: any) => {
  const total = data.reduce((sum: number, item: any) => sum + item.value, 0)
  let currentAngle = 0
  
  return (
    <View style={[$pieChartContainer, { width: radius * 2, height: radius * 2 }]}>
      <View style={[$pieChart, { width: radius * 2, height: radius * 2 }]}>
        {data.map((item: any, index: number) => {
          const percentage = (item.value / total) * 100
          const angle = (percentage / 100) * 360
          const segmentStyle = {
            backgroundColor: item.color,
            transform: [{ rotate: `${currentAngle}deg` }],
          }
          currentAngle += angle
          
          return (
            <View
              key={index}
              style={[
                $pieSegment,
                segmentStyle,
                { width: radius * 2, height: radius * 2 }
              ]}
            />
          )
        })}
        <View style={[$pieCenter, { width: innerRadius * 2, height: innerRadius * 2 }]}>
          {centerLabelComponent && centerLabelComponent()}
        </View>
      </View>
    </View>
  )
}

export const StatisticsScreen: FC<StatisticsScreenProps> = observer(function StatisticsScreen() {
  const [filter, setFilter] = React.useState("Д")
  
  const { habitStore } = rootStore
  const { habits } = habitStore

  // Исправляем использование свойств HabitType
  const completedHabits = habits.filter((habit: HabitType) => {
    // Используем доступные свойства из HabitType
    const hasCompletions = habit.completionsByDate && Object.keys(habit.completionsByDate).length > 0
    return hasCompletions || (habit.streak && habit.streak > 0)
  }).length

  const totalHabits = habits.length
  const completionRate = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0

  // Прогресс по дням недели
  const weeklyProgress = [
    { 
      value: habits.filter((h: HabitType) => 
        Array.isArray(h.frequency) && h.frequency.includes("Понедельник")
      ).length * 10, 
      frontColor: colors.palette.primary600, 
      label: "П" 
    },
    { 
      value: habits.filter((h: HabitType) => 
        Array.isArray(h.frequency) && h.frequency.includes("Вторник")
      ).length * 10, 
      frontColor: colors.palette.primary600, 
      label: "В" 
    },
    { 
      value: habits.filter((h: HabitType) => 
        Array.isArray(h.frequency) && h.frequency.includes("Среда")
      ).length * 10, 
      frontColor: colors.palette.primary600, 
      label: "С" 
    },
    { 
      value: habits.filter((h: HabitType) => 
        Array.isArray(h.frequency) && h.frequency.includes("Четверг")
      ).length * 10, 
      frontColor: colors.palette.primary600, 
      label: "Ч" 
    },
    { 
      value: habits.filter((h: HabitType) => 
        Array.isArray(h.frequency) && h.frequency.includes("Пятница")
      ).length * 10, 
      frontColor: colors.palette.primary600, 
      label: "П" 
    },
    { 
      value: habits.filter((h: HabitType) => 
        Array.isArray(h.frequency) && h.frequency.includes("Суббота")
      ).length * 10, 
      frontColor: colors.palette.primary600, 
      label: "С" 
    },
    { 
      value: habits.filter((h: HabitType) => 
        Array.isArray(h.frequency) && h.frequency.includes("Воскресенье")
      ).length * 10, 
      frontColor: colors.palette.primary600, 
      label: "В" 
    },
  ]

  // Прогресс по привычкам
  const habitProgressData = habits.map((habit: HabitType) => {
    const streak = habit.streak || 0
    const hasCompletions = habit.completionsByDate && Object.keys(habit.completionsByDate).length > 0
    const isCompleted = hasCompletions || streak > 0
    
    return {
      // Используем name вместо title, так как в HabitType есть name
      name: habit.name || "Без названия",
      emoji: habit.emoji || "📊",
      isCompleted: isCompleted,
      streak: streak,
      completionPercentage: streak > 0 ? Math.min(streak * 10, 100) : 0
    }
  })

  // Данные для круговой диаграммы
  const pieData = [
    {
      value: completedHabits,
      color: colors.palette.secondary500,
      text: `${completedHabits} выполнено`
    },
    { 
      value: totalHabits - completedHabits, 
      color: colors.palette.accent500,
      text: `${totalHabits - completedHabits} не выполнено`
    },
  ]

  const renderHabitProgress = () => {
    return (
      <View style={$habitsProgressContainer}>
        <Text text="Прогресс привычек" preset="formLabel" style={{ marginBottom: spacing.md }} />
        {habitProgressData.map((habit: any, index: number) => (
          <View key={index} style={$habitProgressItem}>
            <View style={$habitInfo}>
              <Text text={habit.emoji} style={{ marginRight: spacing.sm }} />
              <View style={$habitText}>
                <Text text={habit.name} size="sm" />
                <Text 
                  text={`Серия: ${habit.streak} дней`} 
                  size="xs" 
                  style={{ color: colors.textDim }} 
                />
              </View>
            </View>
            <View style={$progressBarContainer}>
              <View 
                style={[
                  $progressBar, 
                  { 
                    width: `${habit.completionPercentage}%`,
                    backgroundColor: habit.isCompleted ? colors.palette.secondary500 : colors.palette.accent500
                  }
                ]} 
              />
              <Text 
                text={`${habit.completionPercentage}%`} 
                size="xs" 
                style={$progressText} 
              />
            </View>
          </View>
        ))}
      </View>
    )
  }

  const renderDot = (color: string) => {
    return <View style={[$dotStyle, { backgroundColor: color }]} />
  }

  const renderLegendComponent = () => {
    return (
      <View style={$legendContainer}>
        <View style={$legend}>
          {renderDot(colors.palette.secondary500)}
          <Text style={{ fontSize: 12 }}>Выполнено: {completedHabits}</Text>
        </View>
        <View style={$legend}>
          {renderDot(colors.palette.accent500)}
          <Text style={{ fontSize: 12 }}>Не выполнено: {totalHabits - completedHabits}</Text>
        </View>
      </View>
    )
  }

  return (
    <Screen preset="scroll" safeAreaEdges={["top", "bottom"]} contentContainerStyle={$container}>
      <View style={$topContainer}>
        <Text text="Прогресс" preset="heading" />
        <MaterialCommunityIcons name="export-variant" size={24} color={colors.text} />
      </View>

      {/* Фильтры */}
      <View style={$filtersContainer}>
        {filters.map((f, idx) => (
          <React.Fragment key={f.id}>
            <TouchableOpacity
              style={filter === f.abbr ? $activeFilter : {}}
              onPress={() => setFilter(f.abbr)}
            >
              <Text 
                text={f.abbr} 
                preset="bold" 
                style={filter === f.abbr ? $activeText : {}} 
              />
            </TouchableOpacity>
            {filters.length > idx + 1 && (
              <Text text="•" preset="bold" style={{ color: colors.textDim }} />
            )}
          </React.Fragment>
        ))}
      </View>

      {/* Общая статистика */}
      <View style={$overviewContainer}>
        <Text text="Общий прогресс" preset="formLabel" />
        <Text text={`${completionRate}%`} preset="heading" size="xxl" />
        <Text 
          text={`${completedHabits} из ${totalHabits} привычек выполнено`} 
          size="sm" 
          style={{ color: colors.textDim }} 
        />
      </View>

      {/* График недельного прогресса */}
      <View style={$chartSection}>
        <Text text="Прогресс по дням недели" preset="formLabel" />
        <BarChart
          data={weeklyProgress}
          width={layout.window.width * 0.77}
          height={layout.window.height * 0.2}
        />
      </View>

      {/* Круговая диаграмма */}
      <View style={$chartSection}>
        <Text text="Выполнение привычек" preset="formLabel" />
        <View style={$pieChartWrapper}>
          <PieChart
            data={pieData}
            radius={70}
            innerRadius={50}
            centerLabelComponent={() => {
              return (
                <View style={$pieChartLabelContainer}>
                  <Text text={`${completionRate}%`} preset="subheading" />
                  <Text text="Выполнено" preset="formLabel" size="xs" />
                </View>
              )
            }}
          />
          {renderLegendComponent()}
        </View>
      </View>

      {/* Детальный прогресс по привычкам */}
      {renderHabitProgress()}
    </Screen>
  )
})

// Стили
const $container: ViewStyle = {
  paddingHorizontal: spacing.lg,
  gap: spacing.xl,
  paddingBottom: 70,
}

const $topContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
}

const $overviewContainer: ViewStyle = {
  alignItems: "center",
  padding: spacing.lg,
  backgroundColor: colors.palette.neutral100,
  borderRadius: spacing.md,
  gap: spacing.xs,
}

const $chartSection: ViewStyle = {
  gap: spacing.md,
}

const $filtersContainer: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: spacing.sm,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
}

const $activeFilter: ViewStyle = {
  backgroundColor: colors.palette.primary600,
  borderRadius: 99,
  width: 36,
  height: 36,
  justifyContent: "center",
  alignItems: "center",
}

const $activeText: TextStyle = {
  color: colors.palette.neutral100,
  textAlign: "center",
}

const $dotStyle: ViewStyle = {
  height: 10,
  width: 10,
  borderRadius: 5,
  marginRight: spacing.xs,
}

const $legendContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "center",
  gap: spacing.lg,
  marginTop: spacing.md,
}

const $legend: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const $pieChartWrapper: ViewStyle = {
  alignItems: "center",
  width: "100%",
  gap: spacing.md,
  padding: spacing.md,
  backgroundColor: colors.palette.neutral100,
  borderRadius: spacing.md,
}

const $pieChartContainer: ViewStyle = {
  position: 'relative',
  alignItems: 'center',
  justifyContent: 'center',
}

const $pieChart: ViewStyle = {
  position: 'relative',
  borderRadius: 999,
  overflow: 'hidden',
}

const $pieSegment: ViewStyle = {
  position: 'absolute',
  borderRadius: 999,
  transformOrigin: 'center',
}

const $pieCenter: ViewStyle = {
  position: 'absolute',
  borderRadius: 999,
  backgroundColor: colors.palette.neutral100,
  alignItems: 'center',
  justifyContent: 'center',
  top: '50%',
  left: '50%',
  transform: [{ translateX: -50 }, { translateY: -50 }],
}

const $pieChartLabelContainer: ViewStyle = {
  justifyContent: "center",
  alignItems: "center",
}

const $barChartContainer: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: spacing.md,
  padding: spacing.md,
  alignItems: 'center',
  justifyContent: 'center',
}

const $barsContainer: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'flex-end',
  height: '100%',
  gap: spacing.lg,
}

const $barColumn: ViewStyle = {
  alignItems: 'center',
  height: '100%',
  justifyContent: 'flex-end',
}

const $bar: ViewStyle = {
  width: 20,
  borderRadius: spacing.sm,
  minHeight: 4,
}

const $barLabel: TextStyle = {
  marginTop: spacing.xs,
  color: colors.textDim,
}

const $habitsProgressContainer: ViewStyle = {
  gap: spacing.md,
  padding: spacing.md,
  backgroundColor: colors.palette.neutral100,
  borderRadius: spacing.md,
}

const $habitProgressItem: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingVertical: spacing.xs,
}

const $habitInfo: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  flex: 1,
}

const $habitText: ViewStyle = {
  flex: 1,
}

const $progressBarContainer: ViewStyle = {
  width: 80,
  height: 20,
  backgroundColor: colors.palette.neutral300,
  borderRadius: 10,
  overflow: 'hidden',
  position: 'relative',
}

const $progressBar: ViewStyle = {
  height: '100%',
  borderRadius: 10,
}

const $progressText: TextStyle = {
  position: 'absolute',
  right: 5,
  top: 2,
  color: colors.text,
  fontSize: 10,
}
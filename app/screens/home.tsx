import { observer } from "mobx-react-lite"
import React, { useState, useMemo, useCallback, useEffect } from "react"
import {
  TextStyle,
  View,
  ViewStyle,
  ScrollView,
  TouchableOpacity,
} from "react-native"
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import { AnimatedCircularProgress } from "react-native-circular-progress"

import { Card, Text, Screen, Icon, Button } from "app/components"
import layout from "app/utils/layout"
import { rootStore } from "app/models"
import {
  SimpleBottomSheetModal as BottomSheetModal,
  SimpleBottomSheetView as BottomSheetView,
  SimpleBottomSheetBackdrop as BottomSheetBackdrop,
  SimpleBottomSheetModalProvider as BottomSheetModalProvider,
} from "../components/BottomSheetReplacements"

import { colors, spacing } from "../theme"
import { days } from "app/screens/create-new-habit"
import { HomeNavProps, HomeStackScreenProps } from "app/navigators/types"
import { $tabBarStyles } from "app/navigators/styles"

// helper для форматирования даты в YYYY-MM-DD
function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, "0")
  const d = `${date.getDate()}`.padStart(2, "0")
  return `${y}-${m}-${d}`
}

// Типы данных
interface CheckInType {
  emoji: string
  title: string
  name: string
  amount: string
  color: string
  fill: number
}

// Компонент дня календаря
interface CalendarDayProps {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  completedHabits: number
  totalHabits: number
  onPress?: (date: Date) => void
}

const CalendarDay = ({ 
  date, 
  isCurrentMonth, 
  isToday, 
  isSelected, 
  completedHabits, 
  totalHabits, 
  onPress 
}: CalendarDayProps) => {
  const dayNumber = date.getDate()
  const completionRate = totalHabits > 0 ? completedHabits / totalHabits : 0
  
  return (
    <TouchableOpacity 
      style={[
        $calendarDay,
        !isCurrentMonth && $otherMonthDay,
        isToday && $todayDay,
        isSelected && !isToday && $selectedDay
      ]}
      onPress={() => onPress?.(date)}
      disabled={!isCurrentMonth}
    >
      {/* Прогресс круг */}
      {totalHabits > 0 && completionRate > 0 && (
        <View style={$progressCircle}>
          <View 
            style={[
              $progressFill,
              { 
                height: `${completionRate * 100}%`,
                backgroundColor: colors.palette.primary600 
              }
            ]} 
          />
        </View>
      )}
      
      <Text 
        text={dayNumber.toString()} 
        size="sm"
        style={[
          $calendarDayText,
          !isCurrentMonth && $otherMonthText,
          isToday && $todayDayText,
          isSelected && !isToday && $selectedDayText
        ]}
      />
    </TouchableOpacity>
  )
}

// Компонент быстрой проверки
interface CheckInCardProps {
  checkIn: CheckInType
  index: number
}

const CheckInCard = ({ checkIn, index }: CheckInCardProps) => {
  const [currentAmount, setCurrentAmount] = useState(parseInt(checkIn.amount.split('/')[0]))
  const maxAmount = parseInt(checkIn.amount.split('/')[1])
  const [fill, setFill] = useState(checkIn.fill)

  const handleDecrease = () => {
    if (currentAmount > 0) {
      const newAmount = currentAmount - 1
      setCurrentAmount(newAmount)
      setFill(Math.round((newAmount / maxAmount) * 100))
    }
  }

  const handleIncrease = () => {
    if (currentAmount < maxAmount) {
      const newAmount = currentAmount + 1
      setCurrentAmount(newAmount)
      setFill(Math.round((newAmount / maxAmount) * 100))
    }
  }

  return (
    <Card
      style={$cardContainer}
      verticalAlignment="space-between"
      wrapperStyle={{ padding: spacing.sm }}
      HeadingComponent={
        <View style={$headingContainer}>
          <View style={$emojiContainer}>
            <Text text={checkIn.emoji} size="xl" style={$emojiText} />
          </View>
          <Text text={checkIn.title} size="md" />
        </View>
      }
      ContentComponent={
        <AnimatedCircularProgress
          size={95}
          width={10}
          fill={fill}
          rotation={360}
          tintColor={checkIn.color}
          backgroundColor={colors.palette.neutral200}
          style={$circularProgressContainer}
        >
          {() => (
            <View style={$circularProgressChildren}>
              <Text text={`${currentAmount}/${maxAmount}`} size="md" />
              <Text text={checkIn.name} size="xs" />
            </View>
          )}
        </AnimatedCircularProgress>
      }
      FooterComponent={
        <View style={$footerContainer}>
          <TouchableOpacity onPress={handleDecrease}>
            <MaterialCommunityIcons name="minus" color={colors.palette.neutral500} size={20} />
          </TouchableOpacity>
          <Text text="|" style={{ color: colors.palette.neutral500 }} />
          <TouchableOpacity onPress={handleIncrease}>
            <MaterialCommunityIcons name="plus" color={colors.palette.neutral500} size={20} />
          </TouchableOpacity>
        </View>
      }
    />
  )
}

// Данные для быстрой проверки
const checkIns: CheckInType[] = [
  {
    emoji: "💧",
    title: "Вода",
    name: "стакан",
    amount: "1/4",
    color: colors.palette.accent400,
    fill: 25,
  },
  {
    emoji: "😴",
    title: "Сон",
    name: "часов",
    amount: "6/8",
    color: colors.palette.secondary400,
    fill: 75,
  },
  {
    emoji: "🧘",
    title: "Медитация",
    name: "мин",
    amount: "10/15",
    color: colors.palette.primary600,
    fill: 66,
  },
]

// Основной компонент экрана
type Props = HomeStackScreenProps<"Home">

export const HomeScreen = observer(function HomeScreen({ navigation, route }: Props) {
  
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  const { habitStore } = rootStore
  const { habits, loadHabits, deleteHabit } = habitStore

  useEffect(() => {
    loadHabits()
  }, [loadHabits])

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadHabits()
    })
    return unsubscribe
  }, [navigation, loadHabits])

  const getDayStats = useCallback((date: Date) => {
    const dayIndex = (date.getDay() + 6) % 7
    const dayName = days[dayIndex].day
    const dayHabits = habits.filter(
      (habit) => Array.isArray(habit.frequency) && habit.frequency.includes(dayName),
    )
    const key = formatDate(date)
    const completedCount = dayHabits.filter(h => !!h.completionsByDate?.[key]).length
    return { completed: completedCount, total: dayHabits.length }
  }, [habits])

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const firstDayOfWeek = firstDay.getDay()
    const daysToSubtract = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1
    
    const calendarStart = new Date(firstDay)
    calendarStart.setDate(firstDay.getDate() - daysToSubtract)

    const weeks: Date[][] = []
    const currentDay = new Date(calendarStart)

    for (let week = 0; week < 6; week++) {
      const weekDays: Date[] = []
      for (let day = 0; day < 7; day++) {
        weekDays.push(new Date(currentDay))
        currentDay.setDate(currentDay.getDate() + 1)
      }
      weeks.push(weekDays)
    }

    return weeks
  }, [currentDate])

  const monthYear = currentDate.toLocaleDateString("ru-RU", {
    month: "long",
    year: "numeric",
  })

  const today = new Date()

  const isToday = useCallback(
    (date: Date) =>
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear(),
    [today],
  )

  const isCurrentMonth = useCallback(
    (date: Date) => date.getMonth() === currentDate.getMonth(),
    [currentDate],
  )

  const isSelected = useCallback(
    (date: Date) =>
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear(),
    [selectedDate],
  )

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  const handleCreateHabit = () => {
    navigation.navigate("CreateHabit")
  }

  const handleToggleCompletionForSelected = useCallback(
    (habitId: string) => {
      habitStore.toggleHabitCompletionForDate(habitId, selectedDate)
    },
    [habitStore, selectedDate],
  )

  const handleDeleteHabit = useCallback(
    (habitId: string) => {
      deleteHabit(habitId)
    },
    [deleteHabit],
  )

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={$container}>
      <BottomSheetModalProvider>
        {/* Хедер */}
        <View style={$headerContainer}>
          <View style={$imageContainer}>
            <Text
              text="Life Flow"
              size="xl"
              style={{
                fontFamily: "cherryBomb",
                color: colors.palette.primary600,
                fontSize: 32,
              }}
            />
            <View>
              <Text text="Сегодня" size="xl" weight="bold" />
              <Text
                text={today.toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                size="sm"
                style={{ color: colors.textDim }}
              />
            </View>
          </View>
          <TouchableOpacity style={$headerBtn} onPress={handleCreateHabit}>
            <MaterialCommunityIcons name="plus" color={colors.palette.neutral100} size={28} />
          </TouchableOpacity>
        </View>

        {/* Календарь */}
        <View style={$calendarContainer}>
          <View style={$calendarHeader}>
            <TouchableOpacity onPress={() => navigateMonth("prev")}>
              <MaterialCommunityIcons
                name="chevron-left"
                size={24}
                color={colors.palette.primary600}
              />
            </TouchableOpacity>
            <Text text={monthYear} size="lg" weight="bold" style={{ textTransform: "capitalize" }} />
            <TouchableOpacity onPress={() => navigateMonth("next")}>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={colors.palette.primary600}
              />
            </TouchableOpacity>
          </View>

          <View style={$weekDaysContainer}>
            {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
              <Text key={day} text={day} size="sm" style={$weekDayText} />
            ))}
          </View>

          <View style={$calendarGrid}>
            {calendarData.map((week, weekIndex) => (
              <View key={weekIndex} style={$calendarWeek}>
                {week.map((date, dayIndex) => {
                  const stats = getDayStats(date)
                  return (
                    <CalendarDay
                      key={dayIndex}
                      date={date}
                      isCurrentMonth={isCurrentMonth(date)}
                      isToday={isToday(date)}
                      isSelected={isSelected(date)}
                      completedHabits={stats.completed}
                      totalHabits={stats.total}
                      onPress={handleDateSelect}
                    />
                  )
                })}
              </View>
            ))}
          </View>
        </View>

        {/* Быстрая проверка */}
        <View style={{ gap: spacing.md }}>
          <Text text="Быстрая проверка" preset="subheading" />
          <ScrollView
            contentContainerStyle={$middleContainer}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {checkIns.map((checkIn, i) => (
              <CheckInCard key={`${checkIn.title}-${i}`} checkIn={checkIn} index={i} />
            ))}
          </ScrollView>
        </View>

        {/* Все привычки */}
        <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
          <View style={$habitsHeader}>
            <Text text="Привычки" preset="subheading" />
            {habits.length === 0 && (
              <TouchableOpacity onPress={handleCreateHabit}>
                <Text text="Добавить первую" size="sm" style={$addFirstText} />
              </TouchableOpacity>
            )}
          </View>
          <View style={$bottomContainer}>
            {habits.length > 0 ? (
              habits.map((task) => (
                <Habit
                  key={task.id}
                  task={task}
                  navigation={navigation as any}
                  onToggleCompletion={() => handleToggleCompletionForSelected(task.id)}
                  onDelete={() => handleDeleteHabit(task.id)}
                  selectedDate={selectedDate}
                />
              ))
            ) : (
              <View style={$emptyHabitsContainer}>
                <Text
                  text="У вас пока нет привычек"
                  size="md"
                  style={{ color: colors.textDim, textAlign: "center" }}
                />
                <Text
                  text="Добавьте первую привычку чтобы начать отслеживание"
                  size="sm"
                  style={{ color: colors.textDim, textAlign: "center" }}
                />
                <Button
                  text="Добавить первую привычку"
                  onPress={handleCreateHabit}
                  style={{ marginTop: spacing.md }}
                />
              </View>
            )}
          </View>
        </View>
      </BottomSheetModalProvider>
    </Screen>
  )
})

// Компонент привычки
interface HabitProps {
  task: any
  navigation: HomeNavProps
  onToggleCompletion: () => void
  onDelete: () => void
  selectedDate: Date
}

function Habit({ task, navigation, onToggleCompletion, onDelete, selectedDate }: HabitProps) {
  const bottomSheetRef = React.useRef<any>(null)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const key = formatDate(selectedDate)
  const isDoneToday = !!task.completionsByDate?.[key]
  
  // Расчет прогресса привычки
  const getHabitProgress = useCallback(() => {
    if (!task.frequency || !Array.isArray(task.frequency)) return { completed: 0, total: 0, progress: 0 }
    
    const today = new Date()
    const startDate = task.startDate ? new Date(task.startDate) : new Date()
    const endDate = task.endDate ? new Date(task.endDate) : null
    
    // Считаем общее количество дней в привычке
    let totalDays = 0
    let completedDays = 0
    
    // Если есть продолжительность (в неделях)
    if (task.durationWeeks) {
      totalDays = task.durationWeeks * task.frequency.length
    } else if (endDate) {
      // Или если есть дата окончания
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      totalDays = Math.min(daysDiff * task.frequency.length / 7, 365) // максимум год
    } else {
      // Бесконечная привычка - показываем прогресс за текущую неделю
      totalDays = task.frequency.length
    }
    
    // Считаем выполненные дни
    if (task.completionsByDate) {
      completedDays = Object.keys(task.completionsByDate).length
    }
    
    return {
      completed: Math.min(completedDays, totalDays),
      total: totalDays,
      progress: totalDays > 0 ? (completedDays / totalDays) * 100 : 0
    }
  }, [task])

  const progress = getHabitProgress()
  
  // Оставшиеся дни
  const getRemainingDays = useCallback(() => {
    if (!task.endDate) return null
    
    const endDate = new Date(task.endDate)
    const today = new Date()
    const diffTime = endDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays > 0 ? diffDays : 0
  }, [task])

  const remainingDays = getRemainingDays()

  // Оставшиеся дни в текущей неделе для привычки
  const getRemainingDaysThisWeek = useCallback(() => {
    if (!task.frequency || !Array.isArray(task.frequency)) return 0
    
    const today = new Date()
    const dayOfWeek = today.getDay()
    const currentDayName = days[dayOfWeek].day
    
    // Находим индекс текущего дня в массиве frequency
    const currentDayIndex = task.frequency.indexOf(currentDayName)
    
    // Считаем сколько дней осталось до конца недели
    if (currentDayIndex === -1) return task.frequency.length
    
    return task.frequency.length - currentDayIndex - 1
  }, [task])

  const remainingDaysThisWeek = getRemainingDaysThisWeek()

  const handleOpenSheet = React.useCallback(() => {
    bottomSheetRef.current?.present()
    setIsSheetOpen(true)
  }, [])

  const handleCloseSheet = React.useCallback(() => {
    bottomSheetRef.current?.dismiss()
    setIsSheetOpen(false)
  }, [])

  const handleToggleFinish = React.useCallback((e: any) => {
    e.stopPropagation()
    onToggleCompletion()
  }, [onToggleCompletion])

  const handleEditHabit = React.useCallback(() => {
    handleCloseSheet()
    setTimeout(() => {
      navigation.navigate("EditHabit", { habitId: task.id.toString() })
    }, 300)
  }, [navigation, task.id, handleCloseSheet])

  const handleDeleteHabit = React.useCallback(() => {
    handleCloseSheet()
    setTimeout(() => {
      onDelete()
    }, 300)
  }, [onDelete, handleCloseSheet])

  const renderBackdrop = React.useCallback(
    (props: any) => (
      <BottomSheetBackdrop 
        {...props} 
        disappearsOnIndex={-1} 
        appearsOnIndex={0}
        onPress={handleCloseSheet}
      />
    ),
    [handleCloseSheet],
  )

  React.useEffect(() => {
    const parent = navigation.getParent()
    if (parent) {
      parent.setOptions({ tabBarStyle: isSheetOpen ? { display: "none" } : $tabBarStyles })
    }
    return () => {
      parent?.setOptions({ tabBarStyle: $tabBarStyles })
    }
  }, [isSheetOpen, navigation])

  return (
    <>
      <TouchableOpacity
        style={[
          $taskContainer,
          { opacity: isDoneToday ? 0.6 : 1 },
        ]}
        onPress={handleOpenSheet}
      >
        <View style={$taskLeftContainer}>
          <View style={$taskEmojiContainer}>
            <Text text={task.emoji} size="lg" style={$emojiText} />
          </View>

          <View style={$taskInfo}>
            <Text 
              text={task.title ?? task.name ?? "Без названия"} 
              weight="bold"
              size="md"
              style={$habitName}
            />
            
            {/* Прогресс привычки */}
            <View style={$progressContainer}>
              <Text 
                text={`${progress.completed}/${progress.total}`}
                size="sm" 
                weight="semiBold"
                style={{ color: colors.palette.primary600 }}
              />
              <Text 
                text="дней выполнено"
                size="xs" 
                style={{ color: colors.textDim, marginLeft: 4 }}
              />
            </View>
            
            {/* Оставшиеся дни на этой неделе */}
            <View style={$remainingDaysContainer}>
              <MaterialCommunityIcons 
                name="calendar-week" 
                size={12} 
                color={colors.palette.secondary500} 
              />
              <Text 
                text={`Осталось ${remainingDaysThisWeek} дней на этой неделе`}
                size="xs" 
                style={{ color: colors.palette.secondary500, marginLeft: 4, fontWeight: '500' }}
              />
            </View>
            
            {/* Оставшиеся дни до финиша */}
            {remainingDays !== null && (
              <View style={$deadlineContainerSmall}>
                <MaterialCommunityIcons 
                  name="flag-checkered" 
                  size={12} 
                  color={colors.palette.accent500} 
                />
                <Text 
                  text={`Финиш через ${remainingDays} дней`}
                  size="xs" 
                  style={{ color: colors.palette.accent500, marginLeft: 4, fontWeight: '500' }}
                />
              </View>
            )}
          </View>
        </View>
        
        {/* Кружок выполнения */}
        <TouchableOpacity 
          style={[
            $completionCircle,
            isDoneToday && $completionCircleFilled
          ]}
          onPress={handleToggleFinish}
        >
          {isDoneToday && (
            <MaterialCommunityIcons 
              name="check" 
              size={16} 
              color={colors.palette.neutral100} 
            />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
      
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={[600, "85%"]}
        backdropComponent={renderBackdrop}
        style={$bottomSheetContainer}
        onDismiss={() => setIsSheetOpen(false)}
      >
        <BottomSheetView style={$bottomSheet}>
          <TouchableOpacity 
            style={$closeButton}
            onPress={handleCloseSheet}
          >
            <Icon icon="x" size={20} />
          </TouchableOpacity>
          
          <View style={$bottomSheetIcons}>
            <View style={$taskEmojiContainer}>
              <Text text={task.emoji} size="xl" style={$emojiText} />
            </View>
            <View style={$bottomSheetActions}>
              <TouchableOpacity 
                style={$actionButton}
                onPress={handleEditHabit}
              >
                <Icon icon="pencil" size={16} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[$actionButton, $deleteButton]}
                onPress={handleDeleteHabit}
              >
                <MaterialCommunityIcons name="delete" size={16} color={colors.palette.angry500} />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Заголовок привычки */}
          <Text text={task.name} preset="heading" size="xxl" style={$habitTitle} />
          
          {/* Прогресс бар */}
          <View style={$progressSection}>
            <View style={$progressHeader}>
              <Text text="Прогресс привычки" preset="subheading" />
              <Text 
                text={`${progress.completed}/${progress.total} дней`} 
                size="md" 
                weight="bold"
                style={{ color: colors.palette.primary600 }}
              />
            </View>
            <View style={$progressBar}>
              <View 
                style={[
                  $progressBarFill,
                  { 
                    width: `${progress.progress}%`,
                    backgroundColor: colors.palette.primary600 
                  }
                ]} 
              />
            </View>
            {remainingDays !== null && (
              <View style={$deadlineContainer}>
                <MaterialCommunityIcons 
                  name="flag-checkered" 
                  size={16} 
                  color={colors.palette.primary500} 
                />
                <Text 
                  text={`Финиш ${task.endDate ? new Date(task.endDate).toLocaleDateString('ru-RU') : 'скоро'} (осталось ${remainingDays} дней)`}
                  size="sm" 
                  style={{ color: colors.palette.primary500, marginLeft: 8, fontWeight: '500' }}
                />
              </View>
            )}
          </View>
          
          {/* Дни недели */}
          <View style={$daysSection}>
            <Text preset="formLabel" text="Дни выполнения" style={$sectionTitle} />
            <View style={$daysContainer}>
              {days?.map((d, idx) => (
                <View 
                  key={`day-${d.day}-${idx}`} 
                  style={[
                    $dayContainerStyle,
                    task.frequency?.includes(d.day) && $activeDayContainer
                  ]}
                >
                  <Text 
                    text={d.abbr} 
                    style={[
                      $dayStyle,
                      task.frequency?.includes(d.day) && $activeDayText
                    ]} 
                    size="md" 
                    weight={task.frequency?.includes(d.day) ? "bold" : "normal"}
                  />
                </View>
              ))}
            </View>
          </View>

          {/* Время привычки */}
          <View style={$timeSection}>
            <Text preset="formLabel" text="Время выполнения" style={$sectionTitle} />
            <View style={$timeContainer}>
              <MaterialCommunityIcons 
                name="clock-outline" 
                size={20} 
                color={colors.palette.primary500} 
              />
              <Text 
                text={task.startTime || "Любое время"} 
                size="lg" 
                weight="semiBold"
                style={{ marginLeft: 8 }}
              />
            </View>
          </View>

          {/* Напоминания */}
          <View style={$reminderSection}>
            <Text preset="formLabel" text="Напоминания" style={$sectionTitle} />
            <View style={$reminder}>
              <MaterialCommunityIcons 
                name="bell-outline" 
                size={20} 
                color={colors.palette.primary500} 
              />
              <Text 
                text={task.reminder || "За 30 минут до начала"} 
                size="md" 
                weight="semiBold"
                style={{ marginLeft: 8, flex: 1 }}
              />
              <Icon icon="caretRight" />
            </View>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  )
}

// Стили
const $container: ViewStyle = {
  paddingHorizontal: spacing.lg,
  gap: spacing.xl,
  paddingBottom: 120, // Увеличил отступ для таббара
}

const $calendarContainer: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: spacing.md,
  padding: spacing.md,
  gap: spacing.md,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
}

const $calendarHeader: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: spacing.xs,
}

const $weekDaysContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  paddingHorizontal: spacing.xs,
}

const $weekDayText: TextStyle = {
  textAlign: "center",
  color: colors.textDim,
  fontWeight: "500",
  flex: 1,
}

const $calendarGrid: ViewStyle = {
  gap: spacing.xs,
}

const $calendarWeek: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
}

const $calendarDay: ViewStyle = {
  width: 40,
  height: 40,
  justifyContent: "center",
  alignItems: "center",
  borderRadius: 20,
  flex: 1,
  marginHorizontal: 2,
  position: 'relative',
  overflow: 'hidden',
}

const $todayDay: ViewStyle = {
  backgroundColor: colors.palette.primary600,
}

const $selectedDay: ViewStyle = {
  borderWidth: 2,
  borderColor: colors.palette.primary600,
  backgroundColor: 'transparent',
}

const $otherMonthDay: ViewStyle = {
  opacity: 0.4,
}

const $calendarDayText: TextStyle = {
  textAlign: "center",
  fontWeight: "500",
  position: 'relative',
  zIndex: 10,
}

const $todayDayText: TextStyle = {
  color: colors.palette.neutral100,
  fontWeight: "bold",
}

const $selectedDayText: TextStyle = {
  color: colors.palette.primary600,
  fontWeight: "bold",
}

const $otherMonthText: TextStyle = {
  color: colors.textDim,
}

const $progressCircle: ViewStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 20,
  overflow: 'hidden',
}

const $progressFill: ViewStyle = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
}

const $middleContainer: ViewStyle = {
  gap: 20,
  paddingBottom: 5,
}

const $bottomContainer: ViewStyle = {
  gap: 10,
  marginBottom: spacing.xl,
}

const $headerContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
}

const $imageContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 20,
}

const $headerBtn: ViewStyle = {
  backgroundColor: colors.palette.primary600,
  width: 40,
  height: 40,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 99,
}

const $cardContainer: ViewStyle = {
  borderWidth: 0,
  width: layout.window.width * 0.5,
  height: layout.window.height * 0.32,
  marginRight: 15,
}

const $headingContainer: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 15 }

const $emojiContainer: ViewStyle = {
  backgroundColor: colors.background,
  width: 48,
  height: 48,
  borderRadius: 99,
  alignItems: "center",
  justifyContent: "center",
}

const $emojiText: TextStyle = {
  lineHeight: 0,
  textAlign: "center",
}

const $circularProgressContainer: ViewStyle = { alignSelf: "center" }

const $circularProgressChildren: ViewStyle = { alignItems: "center" }

const $footerContainer: ViewStyle = {
  backgroundColor: colors.background,
  padding: spacing.xs,
  borderRadius: 10,
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
}

const $taskContainer: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.md,
  borderRadius: spacing.sm,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
}

const $taskLeftContainer: ViewStyle = {
  flexDirection: "row",
  gap: 15,
  flex: 1,
}

const $taskInfo: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  gap: 6,
}

const $habitName: TextStyle = {
  marginBottom: 2,
}

const $taskEmojiContainer: ViewStyle = {
  backgroundColor: colors.background,
  width: 44,
  height: 44,
  borderRadius: 99,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
}

const $completionCircle: ViewStyle = {
  width: 24,
  height: 24,
  borderRadius: 12,
  borderWidth: 2,
  borderColor: colors.palette.primary600,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: 'transparent',
}

const $completionCircleFilled: ViewStyle = {
  backgroundColor: colors.palette.primary600,
}

const $bottomSheetContainer: ViewStyle = {
  shadowColor: colors.text,
  shadowOffset: {
    width: 0,
    height: 12,
  },
  shadowOpacity: 0.58,
  shadowRadius: 16.0,
  elevation: 24,
}

const $bottomSheet: ViewStyle = {
  flex: 1,
  gap: spacing.lg,
  padding: spacing.md,
  marginTop: spacing.xs,
  backgroundColor: colors.palette.neutral100,
}

const $daysContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: spacing.md,
}

const $dayContainerStyle: ViewStyle = {
  backgroundColor: colors.palette.neutral200,
  borderRadius: 99,
  width: 44,
  height: 44,
  justifyContent: "center",
  alignItems: "center",
}

const $activeDayContainer: ViewStyle = {
  backgroundColor: colors.palette.primary600,
}

const $dayStyle: TextStyle = {
  lineHeight: 0,
  textAlign: "center",
  color: colors.text,
}

const $activeDayText: TextStyle = {
  color: colors.palette.neutral100,
  fontWeight: "bold",
}

const $reminder: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: colors.palette.neutral200,
  padding: spacing.sm,
  borderRadius: spacing.xs,
  marginTop: spacing.xs,
}

const $bottomSheetIcons: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
}

const $bottomSheetActions: ViewStyle = {
  flexDirection: "row",
  gap: spacing.sm,
}

const $actionButton: ViewStyle = {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: colors.palette.neutral200,
  alignItems: "center",
  justifyContent: "center",
}

const $deleteButton: ViewStyle = {
  backgroundColor: colors.palette.angry100,
}

const $closeButton: ViewStyle = {
  alignSelf: 'flex-end',
  padding: spacing.xs,
  marginBottom: spacing.sm,
}

const $habitsHeader: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
}

const $addFirstText: TextStyle = {
  color: colors.palette.primary600,
  textDecorationLine: 'underline',
}

const $emptyHabitsContainer: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  padding: spacing.xl,
  borderRadius: spacing.sm,
  alignItems: 'center',
  gap: spacing.xs,
}

// Новые стили
const $progressContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const $remainingDaysContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const $deadlineContainerSmall: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const $habitTitle: TextStyle = {
  textAlign: "center",
  marginBottom: spacing.md,
  fontWeight: 'bold',
}

const $progressSection: ViewStyle = {
  marginBottom: spacing.lg,
}

const $progressHeader: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.sm,
}

const $progressBar: ViewStyle = {
  height: 8,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 4,
  overflow: 'hidden',
  marginBottom: spacing.sm,
}

const $progressBarFill: ViewStyle = {
  height: '100%',
  borderRadius: 4,
}

const $deadlineContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.palette.neutral200,
  padding: spacing.sm,
  borderRadius: spacing.sm,
}

const $daysSection: ViewStyle = {
  marginBottom: spacing.lg,
}

const $timeSection: ViewStyle = {
  marginBottom: spacing.lg,
}

const $reminderSection: ViewStyle = {
  marginBottom: spacing.lg,
}

const $sectionTitle: TextStyle = {
  marginBottom: spacing.sm,
  fontSize: 16,
  fontWeight: '600',
}

const $timeContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.palette.neutral100,
  padding: spacing.md,
  borderRadius: spacing.sm,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
}
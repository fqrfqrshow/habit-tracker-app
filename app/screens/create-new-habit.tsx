// D:\Университет\234\habit-tracker-app\app\screens\create-new-habit.tsx

import { observer } from "mobx-react-lite"
import React, { FC } from "react"
import { View, ViewStyle, TouchableOpacity, TextStyle, Alert, ScrollView } from "react-native"
import EmojiPicker from "rn-emoji-keyboard"
import ColorPicker, { HueSlider, Panel1, Preview } from "../components/SimpleColorPicker"

import {
  SimpleBottomSheetModal as BottomSheetModal,
  SimpleBottomSheetView as BottomSheetView,
  SimpleBottomSheetBackdrop as BottomSheetBackdrop,
  SimpleBottomSheetModalProvider as BottomSheetModalProvider,
} from "../components/BottomSheetReplacements"

import { Text, Screen, Icon, Button, TextField, Toggle } from "app/components"
import layout from "app/utils/layout"
import { HomeStackScreenProps } from "../navigators/types"
import { colors, spacing } from "../theme"
import { rootStore } from "app/models"

export const days = [
  { day: "Воскресенье", abbr: "Вс" },
  { day: "Понедельник", abbr: "Пн" },
  { day: "Вторник", abbr: "Вт" },
  { day: "Среда", abbr: "Ср" },
  { day: "Четверг", abbr: "Чт" },
  { day: "Пятница", abbr: "Пт" },
  { day: "Суббота", abbr: "Сб" },
]

export const reminders = [
  { id: 1, name: "Во время привычки" },
  { id: 2, name: "За 5 минут" },
  { id: 3, name: "За 10 минут" },
  { id: 4, name: "За 15 минут" },
  { id: 5, name: "За 30 минут" },
  { id: 6, name: "За 1 час" },
]

interface CreateNewHabitScreenProps extends HomeStackScreenProps<"CreateNewHabit"> {}

export const CreateNewHabitScreen: FC<CreateNewHabitScreenProps> = observer(
  function CreateNewHabitScreen({ navigation }) {
    const [open, setOpen] = React.useState(false)
    const [reminder, setReminder] = React.useState("")
    const [selectedEmoji, setSelectedEmoji] = React.useState("📚")
    const [colorPicked, setColorPicked] = React.useState("#ff0000")
    const [habitTime, setHabitTime] = React.useState({ hours: 12, minutes: 0 })
    const [frequency, setFrequency] = React.useState<(typeof days)[0][]>([])
    const [habitName, setHabitName] = React.useState("")
    const [habitDescription, setHabitDescription] = React.useState("")

    const bottomSheetColorRef = React.useRef<any>(null)
    const bottomSheetReminderRef = React.useRef<any>(null)
    const bottomSheetTimeRef = React.useRef<any>(null)

    const handleOpenColorSheet = React.useCallback(() => {
      bottomSheetColorRef.current?.present()
    }, [])
    
    const handleOpenReminderSheet = React.useCallback(() => {
      bottomSheetReminderRef.current?.present()
    }, [])
    
    const handleOpenTimeSheet = React.useCallback(() => {
      bottomSheetTimeRef.current?.present()
    }, [])

    const renderBackdrop = React.useCallback(
      (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={0} appearsOnIndex={1} />,
      [],
    )

    const handleSelectFrequency = (day: (typeof days)[0]) => {
      setFrequency(prev => {
        const found = prev.findIndex((f) => f.day === day.day)
        if (found === -1) {
          return [...prev, day]
        } else {
          return prev.filter((f) => f.day !== day.day)
        }
      })
    }

    // Функция для форматирования времени
    const formatTime = () => {
      return `${habitTime.hours.toString().padStart(2, '0')}:${habitTime.minutes.toString().padStart(2, '0')}`
    }

    // ✅ ИСПРАВЛЕННАЯ ФУНКЦИЯ СОЗДАНИЯ ПРИВЫЧКИ
    const handleCreateHabit = async () => {
      if (!habitName.trim()) {
        Alert.alert("Ошибка", "Пожалуйста, введите название привычки")
        return
      }

      if (frequency.length === 0) {
        Alert.alert("Ошибка", "Пожалуйста, выберите дни повторения")
        return
      }

      try {
        // ✅ СОЗДАЕМ ПРИВЫЧКУ С ПРАВИЛЬНЫМИ ПОЛЯМИ (используем name вместо title)
        const habitData = {
          name: habitName.trim(), // Используем name вместо title
          description: habitDescription.trim(),
          category: "personal",
          frequency: frequency.map(f => f.day),
          goal: 1,
          color: colorPicked,
          reminderTime: reminder ? formatTime() : undefined,
          emoji: selectedEmoji,
          completedToday: false,
          // Остальные поля будут установлены автоматически в HabitStore
        }

        // ✅ СОЗДАЕМ ПРИВЫЧКУ В ХРАНИЛИЩЕ
        const newHabit = await rootStore.habitStore.createHabit(habitData)

        if (newHabit) {
          Alert.alert("Успех!", `Привычка "${habitName}" создана!`)
          resetForm()
          // ✅ ПРАВИЛЬНЫЙ ПЕРЕХОД НА ГЛАВНЫЙ ЭКРАН
          navigation.goBack() // Возвращаемся назад вместо навигации на HomeTab
        } else {
          Alert.alert("Ошибка", "Не удалось создать привычку")
        }
      } catch (error) {
        console.error("Error creating habit:", error)
        Alert.alert("Ошибка", "Произошла непредвиденная ошибка при создании привычки")
      }
    }

    // Генерация часов и минут
    const hours = Array.from({ length: 24 }, (_, i) => i)
    const minutes = Array.from({ length: 60 }, (_, i) => i)

    // ✅ Функция для сброса формы
    const resetForm = () => {
      setHabitName("")
      setHabitDescription("")
      setSelectedEmoji("📚")
      setColorPicked("#ff0000")
      setHabitTime({ hours: 12, minutes: 0 })
      setFrequency([])
      setReminder("")
    }

    return (
      <Screen preset="scroll" safeAreaEdges={["top", "bottom"]} contentContainerStyle={$container}>
        <BottomSheetModalProvider>
          <View style={$headerContainer}>
            <Icon icon="back" color={colors.text} onPress={() => navigation.goBack()} />
            <Text text="Создать свою привычку" preset="heading" size="lg" />
          </View>
          
          <View style={$subheaderContainer}>
            <TouchableOpacity style={$pillContainer} onPress={() => setOpen(!open)}>
              <Text text={selectedEmoji} style={{ fontSize: 20 }} />
              <Text text="иконка" preset="formLabel" size="md" />
            </TouchableOpacity>
            
            <EmojiPicker
              onEmojiSelected={(selected) => setSelectedEmoji(selected.emoji)}
              open={open}
              onClose={() => setOpen(false)}
            />
            
            <TouchableOpacity style={$pillContainer} onPress={handleOpenColorSheet}>
              <View style={[$pickedColor, { backgroundColor: colorPicked }]} />
              <Text text="цвет" preset="formLabel" size="md" />
            </TouchableOpacity>
            
            <BottomSheetModal
              ref={bottomSheetColorRef}
              snapPoints={[300, "50%"]}
              backdropComponent={renderBackdrop}
              style={$bottomSheetContainer}
              onDismiss={() => console.log('closed')}
            >
              <BottomSheetView style={$bottomSheet}>
                <ColorPicker
                  style={$colorPicker}
                  value={colorPicked}
                  onComplete={({ hex }) => setColorPicked(hex)}
                >
                  <Panel1 />
                  <HueSlider />
                  <Preview />
                </ColorPicker>
              </BottomSheetView>
            </BottomSheetModal>
          </View>

          <View style={$inputsContainer}>
            <TextField 
              label="Название привычки" 
              placeholder="Введите название привычки" 
              required 
              value={habitName}
              onChangeText={setHabitName}
              autoCorrect={false}
              autoCapitalize="sentences"
              maxLength={50}
            />
            <TextField 
              label="Описание" 
              placeholder="Дополнительные детали (необязательно)" 
              value={habitDescription}
              onChangeText={setHabitDescription}
              autoCorrect={false}
              autoCapitalize="sentences"
              maxLength={100}
            />
          </View>
          
          <View style={$gap}>
            <View style={$frequencyContainer}>
              <Text preset="formLabel" text="Повторение" style={$labelStyle} />
              <Text text="*" style={$labelRequired} />
            </View>
            <View style={$daysContainer}>
              {days.map((d, idx) => (
                <TouchableOpacity
                  key={`day-${d.day}-${idx}`}
                  style={[
                    $dayContainerStyle,
                    {
                      backgroundColor: frequency.find((f) => f.day === d.day)
                        ? colors.palette.primary600
                        : colors.palette.neutral100,
                    },
                  ]}
                  onPress={() => handleSelectFrequency(d)}
                >
                  <Text
                    text={d.abbr}
                    style={[
                      $dayStyle,
                      {
                        color: frequency.find((f) => f.day === d.day)
                          ? colors.palette.neutral100
                          : colors.text,
                      },
                    ]}
                    size="md"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={$gap}>
            <View style={$frequencyContainer}>
              <Text preset="formLabel" text="Время привычки" style={$labelStyle} />
              <Text text="*" style={$labelRequired} />
            </View>
            <TouchableOpacity 
              style={$timePickerButton} 
              onPress={handleOpenTimeSheet}
            >
              <Text text={formatTime()} size="md" />
              <Icon icon="caretRight" />
            </TouchableOpacity>
            
            <BottomSheetModal
              ref={bottomSheetTimeRef}
              snapPoints={[400]}
              backdropComponent={renderBackdrop}
              onDismiss={() => console.log('closed')}
            >
              <BottomSheetView style={$timeBottomSheet}>
                <Text text="Выберите время" preset="subheading" style={{ marginBottom: spacing.lg, textAlign: "center" }} />
                <View style={$timePickerContainer}>
                  <ScrollView style={$timeColumn} showsVerticalScrollIndicator={false}>
                    {hours.map((hour) => (
                      <TouchableOpacity
                        key={`hour-${hour}`}
                        style={[
                          $timeOption,
                          habitTime.hours === hour && $timeOptionSelected
                        ]}
                        onPress={() => setHabitTime(prev => ({ ...prev, hours: hour }))}
                      >
                        <Text 
                          text={hour.toString().padStart(2, '0')} 
                          style={[
                            $timeText,
                            habitTime.hours === hour && $timeTextSelected
                          ]} 
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <Text text=":" size="xl" style={$timeSeparator} />
                  <ScrollView style={$timeColumn} showsVerticalScrollIndicator={false}>
                    {minutes.map((minute) => (
                      <TouchableOpacity
                        key={`minute-${minute}`}
                        style={[
                          $timeOption,
                          habitTime.minutes === minute && $timeOptionSelected
                        ]}
                        onPress={() => setHabitTime(prev => ({ ...prev, minutes: minute }))}
                      >
                        <Text 
                          text={minute.toString().padStart(2, '0')} 
                          style={[
                            $timeText,
                            habitTime.minutes === minute && $timeTextSelected
                          ]} 
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                <Button
                  text="Готово"
                  onPress={() => bottomSheetTimeRef.current?.close()}
                  style={$doneButton}
                />
              </BottomSheetView>
            </BottomSheetModal>
          </View>
          
          <View style={$gap}>
            <View style={$remindersContainer}>
              <Text preset="formLabel" text="Напоминания" style={$labelStyle} />
              <Toggle
                variant="switch"
                value={!!reminder}
                onValueChange={() => {
                  if (reminder) {
                    setReminder("")
                  } else {
                    setReminder("За 30 минут")
                  }
                }}
                inputInnerStyle={{
                  backgroundColor: reminder ? colors.success : colors.palette.neutral100,
                }}
                inputOuterStyle={{
                  backgroundColor: colors.palette.neutral400,
                }}
              />
            </View>
            {reminder && (
              <View style={$reminderSection}>
                <TouchableOpacity style={$reminder} onPress={() => handleOpenReminderSheet()}>
                  <Text text={reminder} size="md" />
                  <Icon icon="caretRight" />
                </TouchableOpacity>
                <Text preset="formHelper" text="Когда вы хотите получать напоминание?" style={$helperText} />
              </View>
            )}
            <BottomSheetModal
              ref={bottomSheetReminderRef}
              snapPoints={[300]}
              backdropComponent={renderBackdrop}
              onDismiss={() => console.log('closed')}
            >
              <BottomSheetView style={$reminderBottomSheet}>
                <Text text="Выберите напоминание" preset="subheading" style={{ marginBottom: spacing.lg }} />
                {reminders.map((r, idx) => (
                  <TouchableOpacity
                    key={`reminder-${r.id}-${idx}`}
                    style={$reminderOption}
                    onPress={() => {
                      setReminder(r.name)
                      bottomSheetReminderRef.current?.close()
                    }}
                  >
                    <Text 
                      text={r.name} 
                      size="md" 
                      style={{ 
                        color: reminder === r.name ? colors.palette.primary600 : colors.text 
                      }} 
                    />
                    {reminder === r.name && <Icon icon="check" color={colors.palette.primary600} />}
                  </TouchableOpacity>
                ))}
              </BottomSheetView>
            </BottomSheetModal>
          </View>
          
          <Button
            style={[$btn, !habitName || frequency.length === 0 ? $btnDisabled : {}]}
            textStyle={{ color: colors.palette.neutral100 }}
            onPress={handleCreateHabit}
            disabled={!habitName || frequency.length === 0}
            pressedStyle={{ opacity: 0.8 }}
          >
            Создать привычку
          </Button>
        </BottomSheetModalProvider>
      </Screen>
    )
  },
)

// ... стили остаются без изменений ...
// ... стили остаются без изменений ...
const $container: ViewStyle = {
  paddingHorizontal: spacing.md,
  gap: spacing.xl,
  paddingBottom: 70,
}

const $headerContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 24,
}

const $btn: ViewStyle = {
  backgroundColor: colors.palette.primary600,
  borderWidth: 0,
  borderRadius: spacing.xs,
}

const $btnDisabled: ViewStyle = {
  backgroundColor: colors.palette.neutral400,
  opacity: 0.6,
}

const $pillContainer: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: spacing.xs,
  padding: spacing.xs,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-around",
  width: layout.window.width * 0.25,
}

const $subheaderContainer: ViewStyle = {
  flexDirection: "row",
  gap: 24,
}

const $pickedColor: ViewStyle = { width: 18, height: 18, borderRadius: 99 }

const $bottomSheet: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
}

const $colorPicker: ViewStyle = { width: "50%", gap: 8 }

const $inputsContainer: ViewStyle = {
  gap: 16,
}

const $frequencyContainer: ViewStyle = {
  flexDirection: "row",
  gap: 4,
}

const $labelStyle: TextStyle = { marginBottom: spacing.xs }

const $labelRequired: TextStyle = {
  color: colors.error,
}

const $daysContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
}

const $dayContainerStyle: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: 99,
  width: 44,
  height: 44,
  justifyContent: "center",
  alignItems: "center",
}

const $dayStyle: TextStyle = {
  lineHeight: 0,
  textAlign: "center",
}

const $gap: ViewStyle = { gap: 8 }

const $timePickerButton: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: colors.palette.neutral100,
  padding: spacing.sm,
  borderRadius: spacing.xs,
  marginTop: spacing.xs,
}

const $timeBottomSheet: ViewStyle = {
  flex: 1,
  padding: spacing.lg,
  backgroundColor: colors.palette.neutral100,
}

const $timePickerContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  height: 200,
  marginVertical: spacing.lg,
}

const $timeColumn: ViewStyle = {
  flex: 1,
  maxHeight: 200,
}

const $timeOption: ViewStyle = {
  padding: spacing.sm,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: spacing.xs,
  marginVertical: 2,
}

const $timeOptionSelected: ViewStyle = {
  backgroundColor: colors.palette.primary600,
}

const $timeText: TextStyle = {
  fontSize: 18,
  textAlign: "center",
}

const $timeTextSelected: TextStyle = {
  color: colors.palette.neutral100,
  fontWeight: "bold",
}

const $timeSeparator: TextStyle = {
  marginHorizontal: spacing.md,
  fontSize: 24,
  fontWeight: "bold",
}

const $doneButton: ViewStyle = {
  marginTop: spacing.lg,
  backgroundColor: colors.palette.primary600,
}

const $remindersContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
}

const $reminderSection: ViewStyle = {
  gap: 4,
}

const $reminder: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: colors.palette.neutral100,
  padding: spacing.sm,
  borderRadius: spacing.xs,
  marginTop: spacing.xs,
}

const $reminderOption: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.sm,
  borderBottomWidth: 1,
  borderBottomColor: colors.palette.neutral300,
}

const $reminderBottomSheet: ViewStyle = {
  flex: 1,
  padding: spacing.lg,
  backgroundColor: colors.palette.neutral100,
}

const $helperText: TextStyle = {
  color: colors.palette.neutral500,
  fontSize: 12,
  marginLeft: spacing.sm,
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
import { observer } from "mobx-react-lite"
import React from "react"
import { TextStyle, View, ViewStyle, TouchableOpacity } from "react-native"
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import { RouteProp, useRoute } from "@react-navigation/native"

import { Text, Screen, Icon, Button } from "app/components"
import { colors, spacing } from "../theme"
import { HomeStackScreenProps, HomeStackParamList } from "app/navigators/types"
import { habitCategories } from "app/data/habitCatalog"

type SelectHabitRouteProp = RouteProp<HomeStackParamList, "SelectHabit">

export const SelectHabitScreen = observer(function SelectHabitScreen({
  navigation,
}: HomeStackScreenProps<"SelectHabit">) {
  const route = useRoute<SelectHabitRouteProp>()
  const { categoryId } = route.params
  const category = habitCategories.find((cat) => cat.id === categoryId)

  if (!category) {
    return (
      <Screen preset="fixed">
        <Text text="Категория не найдена" />
      </Screen>
    )
  }

  // Вместо прямого добавления → переход к экрану настройки
  const handleSelectHabit = (habit: typeof category.habits[0]) => {
  navigation.navigate("ConfigureHabit", { habitName: habit.name, habitColor: habit.color })
}

  return (
    <Screen preset="scroll" safeAreaEdges={["top", "bottom"]} contentContainerStyle={$container}>
      <View style={$headerContainer}>
        <Icon icon="back" color={colors.text} onPress={() => navigation.goBack()} />
        <Text text={category.name} preset="heading" size="lg" />
      </View>

      <View style={$habitsContainer}>
        {category.habits.map((habit, idx) => (
          <TouchableOpacity
            key={`habit-${habit.id}-${idx}`}
            style={$habitContainer}
            onPress={() => handleSelectHabit(habit)}
          >
            <View style={$habitLeftContainer}>
              <View style={[$emojiContainer, { backgroundColor: habit.color + "20" }]}>
                <Text text={habit.emoji} size="lg" style={$emojiText} />
              </View>
              <View style={$habitInfo}>
                <Text text={habit.name} preset="formLabel" size="md" />
                <Text
                  text={habit.description}
                  size="xs"
                  style={{ color: colors.textDim }}
                  numberOfLines={2}
                />
              </View>
            </View>
            <View style={$habitRightContainer}>
              <MaterialCommunityIcons
                name="chevron-right"
                color={colors.palette.primary600}
                size={28}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Button
        style={$btn}
        textStyle={{ color: colors.palette.neutral100 }}
        onPress={() => navigation.goBack()}
      >
        Назад
      </Button>
    </Screen>
  )
})

const $container: ViewStyle = {
  paddingHorizontal: spacing.md,
  gap: spacing.xl,
  paddingBottom: 70,
}

const $habitsContainer: ViewStyle = {
  gap: 16,
}

const $headerContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 24,
}

const $habitContainer: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  padding: spacing.md,
  borderRadius: spacing.xs,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
}

const $habitLeftContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 15,
  flex: 1,
}

const $habitInfo: ViewStyle = {
  flex: 1,
  gap: 4,
}

const $habitRightContainer: ViewStyle = {
  backgroundColor: colors.palette.neutral200,
  width: 40,
  height: 40,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 99,
}

const $emojiContainer: ViewStyle = {
  width: 44,
  height: 44,
  borderRadius: 99,
  alignItems: "center",
  justifyContent: "center",
}

const $emojiText: TextStyle = {
  lineHeight: 0,
  textAlign: "center",
}

const $btn: ViewStyle = {
  backgroundColor: colors.palette.primary600,
  borderWidth: 0,
  borderRadius: spacing.xs,
}

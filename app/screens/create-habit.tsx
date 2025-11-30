//app\screens\create-habit.tsx

import { observer } from "mobx-react-lite"
import React, { FC } from "react"
import { 
  TextStyle, 
  View, 
  ViewStyle, 
  TouchableOpacity
} from "react-native"
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"

import { Text, Screen, Icon, Button } from "app/components"


import { colors, spacing } from "../theme"
import { HomeStackScreenProps } from "app/navigators/types"
import { habitCategories } from "app/data/habitCatalog"

interface CreateHabitScreenProps extends HomeStackScreenProps<"CreateHabit"> {}

export const CreateHabitScreen: FC<CreateHabitScreenProps> = observer(function CreateHabitScreen({
  navigation,
}) {
  return (
    <Screen preset="scroll" safeAreaEdges={["top", "bottom"]} contentContainerStyle={$container}>
      <View style={$headerContainer}>
        <Icon icon="x" color={colors.text} onPress={() => navigation.goBack()} />
        <Text text="Выберите категорию" preset="heading" size="lg" />
      </View>
      <View style={$allHabitsContainer}>
        {habitCategories.map((category, idx) => (
          <View key={`category-${category.id}-${idx}`} style={$habitContainer}>
            <View style={$habitLeftContainer}>
              <View style={[$emojiContainer, { backgroundColor: category.color + '20' }]}>
                <Text text={category.emoji} size="lg" style={$emojiText} />
              </View>
              <View>
                <Text text={category.name} preset="formLabel" size="md" />
                <Text 
                  text={`${category.habits.length} привычек`} 
                  size="xs" 
                  style={{ color: colors.textDim }} 
                />
              </View>
            </View>
            <View style={$habitRightContainer}>
              <MaterialCommunityIcons 
                name="chevron-right" 
                color={colors.palette.primary600} 
                size={28} 
                onPress={() => navigation.navigate("SelectHabit", { categoryId: category.id })}
              />
            </View>
          </View>
        ))}
        <TouchableOpacity 
          style={$habitContainer}
          onPress={() => navigation.navigate("CreateNewHabit" as never)} 
        >
          <View style={$habitLeftContainer}>
            <View style={[$emojiContainer, { backgroundColor: colors.palette.primary100 }]}>
              <Text text="➕" size="lg" style={$emojiText} />
            </View>
            <View>
              <Text text="Создать свою привычку" preset="formLabel" size="md" />
              <Text 
                text="Не нашли подходящую категорию?" 
                size="xs" 
                style={{ color: colors.textDim }} 
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

const $allHabitsContainer: ViewStyle = {
  gap: 16,
}

const $headerContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 24,
}

const $habitContainer: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  padding: spacing.sm,
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
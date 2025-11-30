import { observer } from "mobx-react-lite"
import React from "react"
import { View, ViewStyle, TouchableOpacity, TextStyle } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"

import { Text, Screen, TextField, Button } from "app/components"
import { colors, spacing } from "app/theme"
import { rootStore } from "app/models"
import { RootStackParamList } from "app/navigators/AppNavigator"

type Navigation = NativeStackNavigationProp<RootStackParamList, "PersonalInfos">

export const PersonalInfosScreen = observer(function PersonalInfosScreen() {
  const navigation = useNavigation<Navigation>()
  const user = rootStore.authStore?.user

  return (
    <Screen preset="scroll" safeAreaEdges={["top", "bottom"]} contentContainerStyle={$container}>
      {/* Заголовок */}
      <View style={$headerContainer}>
        <View style={$headerBackContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={$backButton}>
            <Text text="← Назад" style={$backButtonText} />
          </TouchableOpacity>
          <Text text="Личная информация" preset="heading" size="lg" />
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("EditPersonalInfos")} style={$editButton}>
          <Text text="✏️" style={$editButtonText} />
        </TouchableOpacity>
      </View>

      {/* Основная информация */}
      <View style={$generalContainer}>
        <Text text="Основная информация" preset="formLabel" />
        <View style={$generalLinksContainer}>
          <TextField
            label="Полное имя"
            value={user?.name ?? ""}
            readOnly
            inputWrapperStyle={$inputWrapper}
          />
          <TextField
            label="Email"
            value={user?.email ?? ""}
            readOnly
            inputWrapperStyle={$inputWrapper}
          />
          <TextField
            label="О себе"
            value={user?.bio ?? ""}
            readOnly
            multiline
            inputWrapperStyle={$inputWrapper}
          />
        </View>
      </View>

      {/* Пароль */}
      <View style={$generalContainer}>
        <Text text="Пароль" preset="formLabel" />
        <View style={$link}>
          <TouchableOpacity 
            style={$passwordLink}
            onPress={() => navigation.navigate("EditPassword")}
          >
            <Text text="🔒 Пароль" style={$linkText} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Кнопка редактирования */}
      <Button
        style={$btn}
        textStyle={{ color: colors.palette.neutral100 }}
        onPress={() => navigation.navigate("EditPersonalInfos")}
        text="Редактировать профиль"
      />
    </Screen>
  )
})

/* ===== Стили ===== */
const $container: ViewStyle = {
  paddingHorizontal: spacing.md,
  gap: spacing.xl,
  paddingBottom: 70,
}

const $headerContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
}

const $headerBackContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.md,
}

const $backButton: ViewStyle = {
  padding: spacing.sm,
}

const $backButtonText: TextStyle = {
  color: colors.palette.primary500,
  fontSize: 16,
}

const $editButton: ViewStyle = {
  padding: spacing.sm,
}

const $editButtonText: TextStyle = {
  fontSize: 16,
}

const $generalContainer: ViewStyle = {
  gap: spacing.md,
}

const $generalLinksContainer: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: spacing.xs,
  padding: spacing.md,
  gap: spacing.lg,
}

const $inputWrapper: ViewStyle = {
  borderRadius: spacing.xs,
  backgroundColor: colors.palette.neutral100,
}

const $link: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: spacing.xs,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
}

const $passwordLink: ViewStyle = {
  padding: spacing.md,
}

const $linkText: TextStyle = {
  color: colors.text,
  fontSize: 16,
}

const $btn: ViewStyle = {
  backgroundColor: colors.palette.primary600,
  borderWidth: 0,
  borderRadius: spacing.xs,
}

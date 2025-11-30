import React from "react"
import { View, Image, TouchableOpacity } from "react-native"
import { Text, Screen } from "app/components"
import { colors, spacing } from "app/theme"
import { useNavigation } from "@react-navigation/native"
import { save } from "app/utils/storage"

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation()

  const handleStart = async () => {
    await save("settings", { onboardingSeen: true })
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" as never }], // 👉 ведём на экран входа
    })
  }

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={["top", "bottom"]}
      style={{ backgroundColor: colors.palette.neutral100 }}
    >
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.lg }}>
        {/* Логотип */}
        <Image
          source={require("assets/images/app-icon-all.png")} // 👉 твой логотип
          style={{ width: 180, height: 180, marginBottom: spacing.xl }}
          resizeMode="contain"
        />

        {/* Заголовок */}
        <Text
          text="Добро пожаловать в LifeFlow"
          preset="heading"
          style={{
            textAlign: "center",
            marginBottom: spacing.md,
            fontSize: 28,
            fontWeight: "700",
          }}
        />

        {/* Подзаголовок */}
        <Text
          text="Приложение для привычек и целей"
          size="md"
          style={{
            textAlign: "center",
            color: colors.textDim,
            fontSize: 16,
            marginBottom: spacing.xxl,
          }}
        />

        {/* Кнопка */}
        <TouchableOpacity
          style={{
            backgroundColor: colors.palette.primary500,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.xxl,
            borderRadius: 14,
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowRadius: 6,
            elevation: 3,
          }}
          onPress={handleStart}
        >
          <Text
            text="Перейти ко входу"
            style={{
              color: colors.palette.neutral100,
              fontWeight: "bold",
              fontSize: 16,
            }}
          />
        </TouchableOpacity>
      </View>
    </Screen>
  )
}

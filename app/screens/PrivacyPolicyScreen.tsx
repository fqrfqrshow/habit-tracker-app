import React from "react"
import { View, ScrollView, TextStyle, ViewStyle, TouchableOpacity } from "react-native"
import { Screen, Text } from "app/components"
import { colors, spacing } from "app/theme"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"

export const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation()

  return (
    <Screen preset="fixed" safeAreaEdges={["top", "bottom"]}>
      {/* Хедер */}
      <View style={$header}>
        <TouchableOpacity style={$backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.palette.primary500} />
        </TouchableOpacity>
        <Text preset="heading" text="LifeFlow" style={$logoText} />
        <View style={$headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={$container} showsVerticalScrollIndicator={false}>
        <View style={$content}>
          {/* Заголовок */}
          <View style={$titleContainer}>
            <Text preset="heading" text="Политика конфиденциальности" style={$title} />
            <Text 
              text="Обновлено: 2025" 
              style={$subtitle}
            />
          </View>

          {/* Основной контент */}
          <View style={$section}>
            <Text preset="subheading" text="1. Сбор данных" style={$sectionTitle} />
            <Text style={$paragraph}>
              LifeFlow собирает только данные, необходимые для работы приложения: 
              ваши привычки, прогресс и настройки напоминаний. 
              Мы не передаем ваши личные данные третьим лицам.
            </Text>
          </View>

          <View style={$section}>
            <Text preset="subheading" text="2. Хранение данных" style={$sectionTitle} />
            <Text style={$paragraph}>
              Все данные хранятся локально на вашем устройстве. 
              При использовании синхронизации данные шифруются 
              и безопасно передаются на наши серверы.
            </Text>
          </View>

          <View style={$section}>
            <Text preset="subheading" text="3. Уведомления" style={$sectionTitle} />
            <Text style={$paragraph}>
              Мы отправляем уведомления только с вашего разрешения. 
              Вы можете в любой момент отключить их в настройках приложения.
            </Text>
          </View>

          <View style={$section}>
            <Text preset="subheading" text="4. Ваши права" style={$sectionTitle} />
            <Text style={$paragraph}>
              Вы можете в любой момент удалить свои данные через настройки приложения. 
              Для этого перейдите в раздел "Настройки" → "Удалить данные".
            </Text>
          </View>

          <View style={$section}>
            <Text preset="subheading" text="5. Контакты" style={$sectionTitle} />
            <Text style={$paragraph}>
              По вопросам конфиденциальности обращайтесь: 
              <Text style={$highlight}> privacy@lifeflow.app</Text>
            </Text>
          </View>

          {/* Информационный баннер */}
          <View style={$banner}>
            <Ionicons name="shield-checkmark" size={24} color={colors.palette.neutral100} />
            <Text 
              text="Ваши данные в безопасности" 
              style={$bannerText}
            />
          </View>

          <Text style={$footerText}>
            Используя LifeFlow, вы соглашаетесь с нашей политикой конфиденциальности.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  )
}

// Стили
const $header: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  backgroundColor: colors.palette.neutral100,
  borderBottomWidth: 1,
  borderBottomColor: colors.palette.neutral300,
}

const $backButton: ViewStyle = {
  padding: spacing.xs,
}

const $logoText: TextStyle = {
  color: colors.palette.primary500,
  fontSize: 20,
  fontWeight: "bold",
}

const $headerSpacer: ViewStyle = {
  width: 32,
}

const $container: ViewStyle = { 
  padding: spacing.lg,
  paddingTop: spacing.xl,
}

const $content: ViewStyle = { 
  gap: spacing.xl,
  paddingBottom: spacing.xl,
}

const $titleContainer: ViewStyle = {
  alignItems: "center",
  marginBottom: spacing.md,
}

const $title: TextStyle = { 
  marginBottom: spacing.xs,
  textAlign: "center",
  color: colors.text,
}

const $subtitle: TextStyle = { 
  color: colors.textDim,
  textAlign: "center",
}

const $section: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  padding: spacing.lg,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
}

const $sectionTitle: TextStyle = {
  marginBottom: spacing.md,
  color: colors.palette.primary600,
}

const $paragraph: TextStyle = { 
  color: colors.text, 
  lineHeight: 22,
  fontSize: 15,
}

const $highlight: TextStyle = {
  color: colors.palette.primary500,
  fontWeight: "600",
}

const $banner: ViewStyle = {
  backgroundColor: colors.palette.primary500,
  padding: spacing.lg,
  borderRadius: 12,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.md,
  marginTop: spacing.md,
}

const $bannerText: TextStyle = {
  color: colors.palette.neutral100,
  fontWeight: "600",
  fontSize: 16,
}

const $footerText: TextStyle = {
  color: colors.textDim,
  textAlign: "center",
  fontSize: 14,
  fontStyle: "italic",
  marginTop: spacing.md,
}
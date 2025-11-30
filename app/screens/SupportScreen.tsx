import React from "react"
import { View, TextStyle, ViewStyle, ScrollView, TouchableOpacity } from "react-native"
import { Screen, Text } from "app/components"
import { colors, spacing } from "app/theme"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"

export const SupportScreen: React.FC = () => {
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
            <Text preset="heading" text="Помощь и поддержка" style={$title} />
            <Text 
              text="Мы всегда готовы помочь вам на пути к лучшим привычкам" 
              style={$subtitle}
            />
          </View>

          {/* Контактная информация */}
          <View style={$card}>
            <View style={$iconContainer}>
              <Ionicons name="mail" size={32} color={colors.palette.primary500} />
            </View>
            <Text preset="subheading" text="Электронная почта" style={$cardTitle} />
            <Text 
              text="support@lifeflow.ru" 
              style={$contactInfo}
            />
            
          </View>

          {/* Частые вопросы */}
          <View style={$card}>
            <View style={$iconContainer}>
              <Ionicons name="help-circle" size={32} color={colors.palette.secondary500} />
            </View>
            <Text preset="subheading" text="Частые вопросы" style={$cardTitle} />
            <View style={$faqItem}>
              <Text text="• Как добавить новую привычку?" style={$faqQuestion} />
              <Text text="Перейдите на главный экран и нажмите '+' в правом верхнем углу" style={$faqAnswer} />
            </View>
            <View style={$faqItem}>
              <Text text="• Как настроить напоминания?" style={$faqQuestion} />
              <Text text="В настройках привычки" style={$faqAnswer} />
            </View>
            <View style={$faqItem}>
              <Text text="• Где посмотреть статистику?" style={$faqQuestion} />
              <Text text="Перейдите на вкладку 'Прогресс' в нижнем меню" style={$faqAnswer} />
            </View>
          </View>

          {/* Сообщество */}
          <View style={$card}>
            <View style={$iconContainer}>
              <Ionicons name="people" size={32} color={colors.palette.accent500} />
            </View>
            <Text preset="subheading" text="Сообщество" style={$cardTitle} />
            <Text 
              text="Присоединяйтесь к нашему сообществу" 
              style={$contactDescription}
            />
            <Text 
              text="@lifeflow_community" 
              style={$socialLink}
            />
          </View>

          {/* Баннер */}
          <View style={$banner}>
            <Ionicons name="heart" size={28} color={colors.palette.neutral100} />
            <Text 
              text="Спасибо, что выбираете LifeFlow!" 
              style={$bannerText}
            />
          </View>
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
  gap: spacing.lg,
}

const $titleContainer: ViewStyle = {
  alignItems: "center",
  marginBottom: spacing.xl,
}

const $title: TextStyle = { 
  marginBottom: spacing.xs,
  textAlign: "center",
  color: colors.text,
}

const $subtitle: TextStyle = { 
  color: colors.textDim,
  textAlign: "center",
  lineHeight: 20,
}

const $card: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  padding: spacing.xl,
  borderRadius: 16,
  shadowColor: colors.palette.neutral800,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 3,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
}

const $iconContainer: ViewStyle = {
  alignItems: "center",
  marginBottom: spacing.md,
}

const $cardTitle: TextStyle = {
  textAlign: "center",
  marginBottom: spacing.sm,
  color: colors.text,
}

const $contactInfo: TextStyle = {
  textAlign: "center",
  fontSize: 18,
  fontWeight: "600",
  color: colors.palette.primary600,
  marginBottom: spacing.xs,
}

const $contactDescription: TextStyle = {
  textAlign: "center",
  color: colors.textDim,
  lineHeight: 20,
}

const $faqItem: ViewStyle = {
  marginBottom: spacing.md,
}

const $faqQuestion: TextStyle = {
  color: colors.text,
  fontWeight: "600",
  marginBottom: 2,
}

const $faqAnswer: TextStyle = {
  color: colors.textDim,
  fontSize: 14,
  lineHeight: 18,
  marginLeft: spacing.md,
}

const $socialLink: TextStyle = {
  textAlign: "center",
  fontSize: 16,
  fontWeight: "600",
  color: colors.palette.accent500,
  marginTop: spacing.xs,
}

const $banner: ViewStyle = {
  backgroundColor: colors.palette.primary500,
  padding: spacing.xl,
  borderRadius: 16,
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
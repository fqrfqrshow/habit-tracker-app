import React, { FC } from "react"
import { View, ViewStyle, ScrollView, TextStyle, TouchableOpacity } from "react-native"
import { Text, Screen, Icon } from "app/components"
import { colors, spacing } from "app/theme"
import { SettingsScreenProps } from "app/navigators/types"

export const AboutUsScreen: FC<SettingsScreenProps> = function AboutUsScreen({ navigation }) {
  return (
    <Screen 
      preset="fixed" 
      safeAreaEdges={["top", "bottom"]} 
      contentContainerStyle={$container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Заголовок */}
        <View style={$header}>
          {/* Кнопка назад слева */}
          <TouchableOpacity style={$backButton} onPress={() => navigation.goBack()}>
            <Icon icon="caretLeft" size={24} color={colors.palette.primary600} />
          </TouchableOpacity>

          <View style={$headerContent}>
            <Icon icon="ladybug" size={60} color={colors.palette.primary600} />
            <Text text="LifeFlow" preset="heading" style={$appName} />
            <Text text="Трекер привычек" style={$appSubtitle} />
          </View>
        </View>

        {/* Основной контент */}
        <View style={$content}>
          {/* Миссия */}
          <View style={$section}>
            <Text text="🎯 Наша миссия" preset="subheading" style={$sectionTitle} />
            <Text 
              text="Помогаем вам создавать и поддерживать полезные привычки, которые меняют жизнь к лучшему. Маленькие шаги каждый день приводят к большим результатам!" 
              style={$sectionText} 
            />
          </View>

          {/* Особенности */}
          <View style={$section}>
            <Text text="✨ Что делает LifeFlow особенным?" preset="subheading" style={$sectionTitle} />
            <View style={$featureList}>
              <View style={$featureItem}>
                <Text text="• Интеллектуальное планирование" style={$featureText} />
              </View>
              <View style={$featureItem}>
                <Text text="• Персональные рекомендации" style={$featureText} />
              </View>
              <View style={$featureItem}>
                <Text text="• Красивая статистика прогресса" style={$featureText} />
              </View>
              <View style={$featureItem}>
                <Text text="• Мотивирующие уведомления" style={$featureText} />
              </View>
            </View>
          </View>

          {/* Цитата */}
          <View style={$quoteSection}>
            <Text 
              text='"Мы — это то, что мы постоянно делаем. Совершенство, следовательно, не действие, а привычка."' 
              style={$quoteText} 
            />
            <Text text="- Аристотель" style={$quoteAuthor} />
          </View>

          {/* Контакты */}
          <View style={$section}>
            <Text text="📞 Свяжитесь с нами" preset="subheading" style={$sectionTitle} />
            <Text 
              text="Есть вопросы или предложения? Мы всегда рады помочь!" 
              style={$sectionText} 
            />
            <Text 
              text="Email: support@lifeflow.ru" 
              style={$contactText} 
            />
          </View>

          {/* Версия */}
          <View style={$versionSection}>
            <Text text="LifeFlow v1.0.0" style={$versionText} />
            <Text text="Сделано с 💙 для вашего развития" style={$madeWithLove} />
          </View>
        </View>
      </ScrollView>
    </Screen>
  )
}

// Стили для AboutUsScreen
const $container: ViewStyle = {
  flex: 1,
}

const $header: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: spacing.xl,
  paddingHorizontal: spacing.lg,
  backgroundColor: colors.palette.primary100,
  borderBottomLeftRadius: 20,
  borderBottomRightRadius: 20,
}

const $backButton: ViewStyle = {
  marginRight: spacing.md,
}

const $headerContent: ViewStyle = {
  flex: 1,
  alignItems: "center",
}

const $appName: TextStyle = {
  color: colors.palette.primary600,
  marginTop: spacing.md,
  textAlign: "center",
}

const $appSubtitle: TextStyle = {
  color: colors.textDim,
  textAlign: "center",
  marginTop: spacing.xs,
}

const $content: ViewStyle = {
  padding: spacing.lg,
  gap: spacing.xl,
}

const $section: ViewStyle = {
  gap: spacing.md,
}

const $sectionTitle: TextStyle = {
  color: colors.palette.primary600,
}

const $sectionText: TextStyle = {
  lineHeight: 22,
  color: colors.text,
}

const $featureList: ViewStyle = {
  gap: spacing.sm,
}

const $featureItem: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const $featureText: TextStyle = {
  color: colors.text,
  lineHeight: 20,
}

const $quoteSection: ViewStyle = {
  backgroundColor: colors.palette.accent100,
  padding: spacing.lg,
  borderRadius: spacing.md,
  alignItems: "center",
}

const $quoteText: TextStyle = {
  fontStyle: "italic",
  textAlign: "center",
  lineHeight: 22,
  color: colors.text,
}

const $quoteAuthor: TextStyle = {
  marginTop: spacing.md,
  color: colors.textDim,
  fontStyle: "italic",
}

const $contactText: TextStyle = {
  color: colors.palette.primary600,
  fontWeight: "500",
  marginTop: spacing.sm,
}

const $versionSection: ViewStyle = {
  alignItems: "center",
  paddingVertical: spacing.xl,
  gap: spacing.sm,
}

const $versionText: TextStyle = {
  color: colors.textDim,
  fontWeight: "500",
}

const $madeWithLove: TextStyle = {
  color: colors.textDim,
  textAlign: "center",
}

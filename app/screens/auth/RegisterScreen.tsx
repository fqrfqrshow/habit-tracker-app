import React, { useState } from "react"
import { View, TextInput, Alert, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native"
import { observer } from "mobx-react-lite"
import { useNavigation } from "@react-navigation/native"
import { Screen, Text, Icon } from "app/components"
import { colors, spacing } from "app/theme"
import { rootStore } from "app/models"

export const RegisterScreen = observer(function RegisterScreen() {
  const navigation = useNavigation()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert("Ошибка", "Введите email и пароль")
      return
    }
    if (password !== confirmPassword) {
      Alert.alert("Ошибка", "Пароли не совпадают")
      return
    }

    try {
      setIsSubmitting(true)
      
      // Правильный вызов метода register с объектом
      const result = await rootStore.authStore.register({
        name: name || "Пользователь", // Если имя не указано, используем значение по умолчанию
        email: email.trim(),
        password: password,
        bio: name ? `Пользователь ${name}` : "Новый пользователь"
      })
      
      if (result.success) {
        Alert.alert("Добро пожаловать ✨", "Регистрация прошла успешно!")
        // Навигация произойдет автоматически через observer в AppNavigator
        // так как authStore.user будет установлен
      } else {
        Alert.alert("Ошибка", result.error || "Ошибка регистрации")
      }
    } catch (error) {
      console.error("Ошибка при регистрации:", error)
      Alert.alert("Ошибка", "Произошла непредвиденная ошибка")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Screen preset="fixed" safeAreaEdges={["top", "bottom"]} style={{ backgroundColor: colors.palette.neutral100 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={$container}>
          {/* Заголовок */}
          <View style={$header}>
            <Icon icon="user" color={colors.palette.primary500} size={48} />
            <Text text="Создайте аккаунт" preset="heading" style={$title} />
            <Text
              text="Присоединяйтесь к LifeFlow и начните путь привычек"
              preset="formHelper"
              style={$subtitle}
            />
          </View>

          {/* Форма */}
          <View style={$form}>
            <View style={$inputContainer}>
              <Text text="Имя (необязательно)" preset="formLabel" style={$label} />
              <TextInput
                placeholder="Введите ваше имя"
                placeholderTextColor={colors.palette.neutral400}
                value={name}
                onChangeText={setName}
                style={$input}
                editable={!isSubmitting}
              />
            </View>

            <View style={$inputContainer}>
              <Text text="Email" preset="formLabel" style={$label} />
              <TextInput
                placeholder="example@email.com"
                placeholderTextColor={colors.palette.neutral400}
                value={email}
                onChangeText={setEmail}
                style={$input}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!isSubmitting}
              />
            </View>

            <View style={$inputContainer}>
              <Text text="Пароль" preset="formLabel" style={$label} />
              <TextInput
                placeholder="Не менее 6 символов"
                placeholderTextColor={colors.palette.neutral400}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={$input}
                editable={!isSubmitting}
              />
            </View>

            <View style={$inputContainer}>
              <Text text="Подтвердите пароль" preset="formLabel" style={$label} />
              <TextInput
                placeholder="Повторите пароль"
                placeholderTextColor={colors.palette.neutral400}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                style={$input}
                editable={!isSubmitting}
              />
            </View>

            {/* Кнопка регистрации */}
            <TouchableOpacity
              style={[$button, (isSubmitting || rootStore.authStore.isLoading) && $buttonDisabled]}
              onPress={handleRegister}
              disabled={isSubmitting || rootStore.authStore.isLoading}
            >
              {(isSubmitting || rootStore.authStore.isLoading) ? (
                <ActivityIndicator color={colors.palette.neutral100} />
              ) : (
                <Text text="Создать аккаунт" style={$buttonText} />
              )}
            </TouchableOpacity>
          </View>

          {/* Футер */}
          <View style={$footer}>
            <Text text="Уже есть аккаунт?" preset="formHelper" style={$footerText} />
            <TouchableOpacity onPress={() => navigation.goBack()} disabled={isSubmitting}>
              <Text text=" Войти" style={$loginLink} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Screen>
  )
})

const $container = { flex: 1, padding: spacing.xl, justifyContent: "center" as const }
const $header = { alignItems: "center" as const, marginBottom: spacing.xxl }
const $title = { color: colors.palette.primary500, fontSize: 28, fontWeight: "bold" as const, marginTop: spacing.sm, textAlign: "center" as const }
const $subtitle = { color: colors.palette.neutral600, textAlign: "center" as const, fontSize: 16, lineHeight: 22, marginTop: spacing.sm }
const $form = { gap: spacing.lg }
const $inputContainer = { gap: spacing.xs }
const $label = { color: colors.palette.primary500, fontWeight: "600" as const, fontSize: 16 }
const $input = { 
  borderWidth: 2, 
  borderColor: colors.palette.primary300, 
  backgroundColor: colors.palette.neutral100, 
  padding: spacing.md, 
  borderRadius: 12, 
  fontSize: 16, 
  color: colors.text 
}
const $button = { 
  backgroundColor: colors.palette.primary500, 
  paddingVertical: spacing.md, 
  borderRadius: 12, 
  marginTop: spacing.md, 
  alignItems: "center" as const, 
  shadowColor: "#000", 
  shadowOpacity: 0.1, 
  shadowRadius: 6, 
  elevation: 3 
}
const $buttonDisabled = { backgroundColor: colors.palette.neutral400 }
const $buttonText = { color: colors.palette.neutral100, fontWeight: "bold" as const, fontSize: 16 }
const $footer = { 
  flexDirection: "row" as const, 
  justifyContent: "center" as const, 
  alignItems: "center" as const, 
  marginTop: spacing.xl, 
  padding: spacing.md 
}
const $footerText = { color: colors.palette.neutral600 }
const $loginLink = { color: colors.palette.secondary500, fontSize: 16, fontWeight: "600" as const }
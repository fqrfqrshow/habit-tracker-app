import React, { useState } from "react"
import {
  Alert,
  TextInput,
  View,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"
import { observer } from "mobx-react-lite"
import { Screen, Text } from "app/components"
import { colors, spacing } from "app/theme"
import { rootStore } from "app/models"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { RootStackParamList } from "app/navigators/AppNavigator"

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Login">
}

export const LoginScreen: React.FC<LoginScreenProps> = observer(({ navigation }) => {
  const authStore = rootStore?.authStore
  if (!authStore) {
    return (
      <Screen preset="fixed" contentContainerStyle={$container}>
        <Text preset="heading" text="Ошибка инициализации" />
        <Text
          text="Хранилище не загружено. Проверь импорт rootStore из 'app/models'."
          style={$hint}
        />
      </Screen>
    )
  }

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert("Ошибка", "Введите email")
      return false
    }
    if (!password.trim()) {
      Alert.alert("Ошибка", "Введите пароль")
      return false
    }
    
    // Простая валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      Alert.alert("Ошибка", "Введите корректный email")
      return false
    }
    
    return true
  }

  const handleLogin = async () => {
    // Валидация формы
    if (!validateForm()) {
      return
    }

    try {
      setIsSubmitting(true)
      console.log("Попытка входа с email:", email.trim())
      
      const { success, error } = await authStore.login(email.trim(), password.trim())
      
      console.log("Результат входа:", { success, error, user: authStore.user })
      
      if (!success) {
        Alert.alert(
          "Ошибка входа", 
          error ?? "Неверный email или пароль. Попробуйте снова."
        )
        return
      }
      
      // Проверяем, установился ли пользователь
      if (authStore.user) {
        console.log("Вход успешен, пользователь:", authStore.user)
        // Навигация произойдет автоматически через observer в AppNavigator
      } else {
        console.log("Пользователь не установлен после успешного входа")
        Alert.alert("Ошибка", "Не удалось завершить вход")
      }
      
    } catch (e) {
      console.error("Ошибка при входе:", e)
      Alert.alert(
        "Ошибка", 
        "Произошла непредвиденная ошибка. Проверьте подключение к интернету."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const goToRegister = () => navigation.navigate("Register")

  return (
    <KeyboardAvoidingView 
      style={$flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView 
        contentContainerStyle={$scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Screen
          preset="fixed"
          safeAreaEdges={["top", "bottom"]}
          contentContainerStyle={$container}
        >
          <Text preset="heading" text="Вход" />
          <Text text="Добро пожаловать" style={$hint} />

          <View style={$form}>
            <View style={$field}>
              <Text text="Email" preset="formLabel" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                placeholderTextColor={colors.textDim}
                style={$input}
                editable={!isSubmitting}
                returnKeyType="next"
              />
            </View>

            <View style={$field}>
              <Text text="Пароль" preset="formLabel" />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="********"
                secureTextEntry
                autoComplete="password"
                placeholderTextColor={colors.textDim}
                style={$input}
                editable={!isSubmitting}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
            </View>

            <TouchableOpacity
              style={[$button, isSubmitting && $buttonDisabled]}
              disabled={isSubmitting}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text text="Войти" style={$buttonText} />
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={goToRegister} 
              style={$linkBtn}
              disabled={isSubmitting}
            >
              <Text text="Нет аккаунта? Зарегистрироваться" style={$link} />
            </TouchableOpacity>
          </View>
        </Screen>
      </ScrollView>
    </KeyboardAvoidingView>
  )
})

// ===== Стили =====
const $flex: ViewStyle = { flex: 1 }
const $scrollContent: ViewStyle = { flexGrow: 1 }
const $container: ViewStyle = { 
  padding: spacing.lg, 
  gap: spacing.md,
  flex: 1,
  justifyContent: "center",
  minHeight: "100%"
}
const $hint: TextStyle = { color: colors.textDim, textAlign: "center" }
const $form: ViewStyle = { 
  marginTop: spacing.lg, 
  gap: spacing.lg,
  width: "100%"
}
const $field: ViewStyle = { gap: spacing.xs }
const $input: TextStyle = {
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  borderRadius: spacing.sm,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  color: colors.text,
  backgroundColor: colors.palette.neutral100,
  fontSize: 16,
}
const $button: ViewStyle = {
  backgroundColor: colors.palette.primary600,
  paddingVertical: spacing.md,
  borderRadius: spacing.sm,
  alignItems: "center",
  marginTop: spacing.md,
}
const $buttonDisabled: ViewStyle = { opacity: 0.6 }
const $buttonText: TextStyle = { 
  color: "#fff", 
  fontWeight: "600",
  fontSize: 16,
}
const $linkBtn: ViewStyle = { 
  marginTop: spacing.md,
  alignItems: "center"
}
const $link: TextStyle = { 
  color: colors.palette.primary600, 
  textAlign: "center",
  fontSize: 14,
}
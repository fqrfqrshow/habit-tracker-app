import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import {
  View,
  TextInput,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Alert,
} from "react-native"
import { Screen, Text } from "app/components"
import { colors, spacing } from "app/theme"
import { rootStore } from "app/models"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { RootStackParamList } from "app/navigators/AppNavigator"
import { Ionicons } from "@expo/vector-icons"

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "EditPersonalInfos">
}

export const EditPersonalInfosScreen: React.FC<Props> = observer(({ navigation }) => {
  const { authStore } = rootStore

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [bio, setBio] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Устанавливаем опции заголовка с кнопкой назад
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity 
          style={$backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.palette.primary500} />
        </TouchableOpacity>
      ),
      headerTitle: "Редактирование профиля",
    })
  }, [navigation])

  useEffect(() => {
    if (!authStore?.user) return
    setName(authStore.user.name ?? "")
    setEmail(authStore.user.email ?? "")
    setBio(authStore.user.bio ?? "")
  }, [authStore?.user])

  const handleSave = async () => {
    if (!authStore?.user) {
      Alert.alert("Ошибка", "Пользователь не найден")
      return
    }

    try {
      setIsSaving(true)
      console.log("Сохранение данных:", { name, email, bio })

      // Используем метод updateUserProfile
      await authStore.updateUserProfile({
        name: name.trim(),
        email: email.trim(),
        bio: bio.trim(),
      })

      console.log("Профиль успешно обновлен")
      
      Alert.alert("Готово", "Профиль обновлён", [
        {
          text: "OK",
          onPress: () => {
            navigation.navigate("PersonalInfos")
          }
        }
      ])

    } catch (error: any) {
      console.error("Ошибка при сохранении:", error)
      
      const errorMessage = error?.message || "Не удалось сохранить изменения"
      Alert.alert("Ошибка", errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  // Проверяем, доступен ли authStore и пользователь
  if (!authStore || !authStore.user) {
    return (
      <Screen preset="fixed" contentContainerStyle={$container}>
        <Text preset="heading" text="Ошибка" />
        <Text text="Данные пользователя не загружены" style={$hint} />
        <TouchableOpacity style={$button} onPress={() => navigation.goBack()}>
          <Text text="Вернуться назад" style={$buttonText} />
        </TouchableOpacity>
      </Screen>
    )
  }

  const hasChanges = 
    name !== (authStore.user.name ?? "") ||
    email !== (authStore.user.email ?? "") ||
    bio !== (authStore.user.bio ?? "")

  return (
    <Screen 
      preset="scroll" 
      safeAreaEdges={["top", "bottom"]} 
      contentContainerStyle={$container}
    >
      <Text text="Обнови информацию о себе" style={$hint} />

      <View style={$form}>
        <View style={$field}>
          <Text text="Имя" preset="formLabel" />
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ваше имя"
            placeholderTextColor={colors.textDim}
            style={$input}
          />
        </View>

        <View style={$field}>
          <Text text="Email" preset="formLabel" />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor={colors.textDim}
            style={$input}
          />
        </View>

        <View style={$field}>
          <Text text="О себе" preset="formLabel" />
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Коротко о себе"
            placeholderTextColor={colors.textDim}
            style={[$input, { minHeight: 80, textAlignVertical: "top" }]}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Основная кнопка сохранения */}
        <TouchableOpacity
          style={[
            $button, 
            (!hasChanges || isSaving) && $buttonDisabled
          ]}
          disabled={!hasChanges || isSaving}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text text="Сохранить" style={$buttonText} />
          )}
        </TouchableOpacity>

        {/* Кнопка отмены */}
        <TouchableOpacity
          style={[$button, $cancelButton]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text text="Отмена" style={$cancelButtonText} />
        </TouchableOpacity>
      </View>
    </Screen>
  )
})

const $container: ViewStyle = { 
  padding: spacing.lg, 
  gap: spacing.md,
  flex: 1 
}

const $hint: TextStyle = { 
  color: colors.textDim,
  textAlign: "center",
  marginBottom: spacing.md,
}

const $form: ViewStyle = { 
  marginTop: spacing.lg, 
  gap: spacing.lg 
}

const $field: ViewStyle = { 
  gap: spacing.xs 
}

const $input: TextStyle = {
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  borderRadius: spacing.sm,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  color: colors.text,
  backgroundColor: colors.palette.neutral100,
}

const $button: ViewStyle = {
  backgroundColor: colors.palette.primary600,
  borderRadius: spacing.sm,
  paddingVertical: spacing.md,
  alignItems: "center",
  marginTop: spacing.md,
}

const $cancelButton: ViewStyle = {
  backgroundColor: "transparent",
  borderWidth: 1,
  borderColor: colors.palette.neutral400,
}

const $buttonDisabled: ViewStyle = { 
  backgroundColor: colors.palette.neutral400 
}

const $buttonText: TextStyle = { 
  color: "#fff", 
  fontWeight: "600" 
}

const $cancelButtonText: TextStyle = { 
  color: colors.palette.neutral600, 
  fontWeight: "600" 
}

const $backButton: ViewStyle = {
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
}
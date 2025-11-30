import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { View, ViewStyle, Alert, TouchableOpacity, TextStyle, ActivityIndicator } from "react-native"
import { useNavigation } from "@react-navigation/native"

import { Text, Screen, TextField, Button } from "app/components"
import { colors, spacing } from "app/theme"
import { rootStore } from "app/models"

export const EditPasswordScreen = observer(function EditPasswordScreen() {
  const navigation = useNavigation()
  const [infos, setInfos] = useState({
    current_password: "",
    new_password: "",
    confirm_new_password: "",
  })

  const handleSave = async () => {
    if (!infos.current_password || !infos.new_password || !infos.confirm_new_password) {
      Alert.alert("Ошибка", "Заполните все поля")
      return
    }

    if (infos.new_password !== infos.confirm_new_password) {
      Alert.alert("Ошибка", "Новые пароли не совпадают")
      return
    }

    if (infos.new_password.length < 6) {
      Alert.alert("Ошибка", "Новый пароль должен быть не менее 6 символов")
      return
    }

    try {
      // Заглушка: можно реализовать метод в AuthStore
      // await rootStore.authStore.changePassword(infos.current_password, infos.new_password)

      Alert.alert("Успех", "Пароль успешно изменен")
      navigation.goBack()
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось изменить пароль")
    }
  }

  return (
    <Screen preset="scroll" safeAreaEdges={["top", "bottom"]} contentContainerStyle={$container}>
      <View style={$headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={$backButton}>
          <Text text="← Назад" style={$backButtonText} />
        </TouchableOpacity>
        <Text text="Изменить пароль" preset="heading" size="lg" />
      </View>

      <View style={$generalLinksContainer}>
        <TextField
          label="Текущий пароль"
          value={infos.current_password}
          secureTextEntry
          onChangeText={(text) => setInfos({ ...infos, current_password: text })}
          inputWrapperStyle={$inputWrapper}
        />
        <TextField
          label="Новый пароль"
          secureTextEntry
          value={infos.new_password}
          onChangeText={(text) => setInfos({ ...infos, new_password: text })}
          inputWrapperStyle={$inputWrapper}
        />
        <TextField
          label="Подтвердите новый пароль"
          secureTextEntry
          value={infos.confirm_new_password}
          onChangeText={(text) => setInfos({ ...infos, confirm_new_password: text })}
          inputWrapperStyle={$inputWrapper}
        />
      </View>

      <Button
        style={$btn}
        textStyle={{ color: colors.palette.neutral100 }}
        onPress={handleSave}
        text="Сохранить изменения"
      >
        {rootStore.authStore.isLoading && <ActivityIndicator color={colors.palette.neutral100} />}
      </Button>
    </Screen>
  )
})

const $container: ViewStyle = {
  paddingHorizontal: spacing.md,
  gap: spacing.xl,
  paddingBottom: 70,
}

const $headerContainer: ViewStyle = {
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

const $btn: ViewStyle = {
  backgroundColor: colors.palette.primary600,
  borderWidth: 0,
  borderRadius: spacing.xs,
  alignItems: "center",
  paddingVertical: spacing.md,
}

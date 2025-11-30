import { observer } from "mobx-react-lite"
import React, { FC, useState, useEffect } from "react"
import {
  View,
  ViewStyle,
  TouchableOpacity,
  Alert,
  TextStyle,
  ActivityIndicator,
  Platform,
} from "react-native"
import { Text, Screen, Icon, IconTypes } from "app/components"
import { colors, spacing } from "app/theme"
import { rootStore } from "app/models"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { RootStackParamList } from "app/navigators/AppNavigator"

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

interface GeneralLinkType {
  title: string
  icon: IconTypes
  id: string
  to?: keyof RootStackParamList
  action?: () => void | Promise<void>
}

interface UserProfile {
  name: string
  email: string
  initials: string
}

const generalLinks: GeneralLinkType[] = [
  { title: "Личная информация", icon: "user", id: "personal-info", to: "PersonalInfos" },
  { title: "Уведомления", icon: "bellFilled", id: "notifications", to: "NotificationSettings" },
]

const supportLinks: GeneralLinkType[] = [
  { title: "Помощь и поддержка", icon: "alert", id: "help-support", to: "Support" },
  { title: "Политика конфиденциальности", icon: "lock", id: "privacy-policy", to: "PrivacyPolicy" },
]

const aboutLinks: GeneralLinkType[] = [
  { title: "О приложении", icon: "globe", id: "about-app", to: "AboutUs" },
]

export const SettingsScreen: FC = observer(function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>()
  const { authStore } = rootStore

  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Загрузка...",
    email: "Загрузка...",
    initials: "??",
  })

  useEffect(() => {
    loadUserData()
  }, [authStore.user])

  const loadUserData = async () => {
    try {
      setIsLoading(true)
      const userName = authStore.user?.name || authStore.user?.email?.split("@")[0] || "Пользователь"
      const userEmail = authStore.user?.email || "email@example.com"
      setUserProfile({ name: userName, email: userEmail, initials: getInitials(userName) })
    } catch {
      setUserProfile({ name: "Пользователь", email: "email@example.com", initials: "ПС" })
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name: string): string => {
    if (!name || name === "Загрузка...") return "??"
    if (name.includes("@")) return name.charAt(0).toUpperCase()
    return name.split(" ").filter(Boolean).map(w => w[0]).join("").toUpperCase().slice(0, 2)
  }

  const handleLogout = () => {
    if (Platform.OS === "web") {
      // На Web сразу выполняем выход
      performLogout()
    } else {
      // На мобильных показываем Alert
      Alert.alert("Выход из аккаунта", "Вы уверены, что хотите выйти?", [
        { text: "Отмена", style: "cancel" },
        { text: "Выйти", style: "destructive", onPress: performLogout },
      ])
    }
  }

  const performLogout = async () => {
    try {
      setIsLoggingOut(true)
      await authStore.logout()
      if (Platform.OS === "web") {
        navigation.navigate("Login" as never)
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        })
      }
    } catch (error) {
      console.error(error)
      if (Platform.OS !== "web") {
        Alert.alert("Ошибка", "Не удалось выйти из аккаунта")
      }
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleLinkPress = (link: GeneralLinkType) => {
    try {
      if (link.to) {
        navigation.navigate(link.to as never)
      } else if (link.action) {
        link.action()
      }
    } catch (error) {
      console.error(`Ошибка при обработке ссылки ${link.id}:`, error)
    }
  }

  const handleEditProfile = () => {
    navigation.navigate("EditPersonalInfos" as never)
  }

  if (isLoading) {
    return (
      <Screen preset="fixed" contentContainerStyle={$loadingContainer}>
        <ActivityIndicator size="large" color={colors.palette.primary600} />
        <Text text="Загрузка..." style={$loadingText} />
      </Screen>
    )
  }

  return (
    <Screen preset="scroll" safeAreaEdges={["top", "bottom"]} contentContainerStyle={$container}>
      <View style={$header}>
        <Text text="Настройки" preset="heading" />
        <Text text="Управление аккаунтом" style={$subtitle} />
      </View>

      <View style={$profileCard}>
        <View style={$profileHeader}>
          <View style={$avatar}>
            <Text text={userProfile.initials} style={$avatarText} />
          </View>
          <View style={$profileInfo}>
            <Text text={userProfile.name} preset="subheading" />
            <Text text={userProfile.email} size="sm" style={{ color: colors.textDim }} />
          </View>
          <TouchableOpacity style={$editButton} onPress={handleEditProfile} disabled={isLoggingOut}>
            <Icon icon="pencil" size={18} color={colors.palette.primary600} />
          </TouchableOpacity>
        </View>
      </View>

      <Section title="Основные" links={generalLinks} onLinkPress={handleLinkPress} />
      <Section title="Поддержка" links={supportLinks} onLinkPress={handleLinkPress} />
      <Section title="О приложении" links={aboutLinks} onLinkPress={handleLinkPress} />

      <View style={$logoutSection}>
        <TouchableOpacity
          style={[$logoutButton, isLoggingOut && $logoutButtonDisabled]}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color={colors.palette.angry500} />
          ) : (
            <Icon icon="logout" color={colors.palette.angry500} />
          )}
          <Text
            text={isLoggingOut ? "Выход..." : "Выйти из аккаунта"}
            style={[$logoutText, isLoggingOut && $logoutTextDisabled]}
          />
        </TouchableOpacity>
      </View>
    </Screen>
  )
})

interface SectionProps {
  title: string
  links: GeneralLinkType[]
  onLinkPress: (link: GeneralLinkType) => void
}

const Section: FC<SectionProps> = ({ title, links, onLinkPress }) => (
  <View style={$section}>
    <Text text={title} preset="formLabel" style={$sectionTitle} />
    <View style={$linksCard}>
      {links.map((link, index) => (
        <Link key={link.id} {...link} isLast={index === links.length - 1} onPress={() => onLinkPress(link)} />
      ))}
    </View>
  </View>
)

interface LinkProps extends GeneralLinkType {
  isLast?: boolean
  onPress: () => void
}

const Link: FC<LinkProps> = ({ icon, title, isLast, onPress }) => (
  <View>
    <TouchableOpacity style={$link} onPress={onPress}>
      <View style={$linkContent}>
        <Icon icon={icon} size={20} color={colors.text} />
        <Text text={title} style={$linkText} />
      </View>
      <Icon icon="caretRight" size={16} color={colors.textDim} />
    </TouchableOpacity>
    {!isLast && <View style={$separator} />}
  </View>
)

// ===== Стили =====
const $container: ViewStyle = {
  paddingHorizontal: spacing.lg,
  gap: spacing.xl,
  paddingBottom: 70,
}

const $loadingContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  gap: spacing.md,
}

const $loadingText: TextStyle = {
  color: colors.textDim,
}

const $header: ViewStyle = {
  marginTop: spacing.xs,
}

const $subtitle: TextStyle = {
  color: colors.textDim,
  marginTop: spacing.xs,
}

const $profileCard: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: spacing.md,
  padding: spacing.lg,
}

const $profileHeader: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.md,
}

const $avatar: ViewStyle = {
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: colors.palette.primary600,
  justifyContent: "center",
  alignItems: "center",
}

const $avatarText: TextStyle = {
  color: colors.palette.neutral100,
  fontWeight: "bold",
  fontSize: 18,
}

const $profileInfo: ViewStyle = {
  flex: 1,
  gap: 2,
}

const $editButton: ViewStyle = {
  padding: spacing.xs,
}

const $section: ViewStyle = {
  gap: spacing.md,
}

const $sectionTitle: TextStyle = {
  marginBottom: spacing.xs,
}

const $linksCard: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: spacing.md,
  overflow: "hidden",
}

const $link: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.md,
}

const $linkContent: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.md,
  flex: 1,
}

const $linkText: TextStyle = {
  flex: 1,
}

const $separator: ViewStyle = {
  height: 1,
  backgroundColor: colors.palette.neutral200,
  marginLeft: 36,
}

const $logoutSection: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: spacing.md,
  padding: spacing.md,
}

const $logoutButton: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.md,
  paddingVertical: spacing.xs,
}

const $logoutButtonDisabled: ViewStyle = {
  opacity: 0.5,
}

const $logoutText: TextStyle = {
  color: colors.palette.angry500,
  fontWeight: "600",
}

const $logoutTextDisabled: TextStyle = {
  color: colors.textDim,
}

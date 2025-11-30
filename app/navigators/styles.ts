import { colors, spacing } from "app/theme"
import { ViewStyle } from "react-native"

export const $tabBarStyles: ViewStyle = {
  position: "absolute",
  bottom: 25,
  left: 20,
  right: 20,
  height: 75,
  borderRadius: spacing.lg,
  backgroundColor: colors.palette.neutral100,
  shadowColor: colors.text,
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
  paddingVertical: spacing.xs,
  borderTopWidth: 0,
}
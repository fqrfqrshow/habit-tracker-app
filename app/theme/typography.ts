import { Platform } from "react-native"
import {
  CherryBombOne_400Regular as cherryBomb,
} from "@expo-google-fonts/cherry-bomb-one"
import {
  PlaypenSans_400Regular as playpenRegular,
  PlaypenSans_500Medium as playpenMedium,
  PlaypenSans_600SemiBold as playpenSemiBold,
  PlaypenSans_700Bold as playpenBold,
} from "@expo-google-fonts/playpen-sans"

export const customFontsToLoad = {
  cherryBomb,
  playpenRegular,
  playpenMedium,
  playpenSemiBold,
  playpenBold,
}

const fonts = {
  cherry: {
    // Cherry Bomb для заголовков и логотипа
    normal: "cherryBomb",
  },
  playpen: {
    // Playpen Sans для всего русского текста
    normal: "playpenRegular",
    medium: "playpenMedium", 
    semiBold: "playpenSemiBold",
    bold: "playpenBold",
  },
  system: {
    // Резервный системный шрифт
    light: Platform.select({ ios: "System", android: "sans-serif-light" }),
    normal: Platform.select({ ios: "System", android: "sans-serif" }),
    medium: Platform.select({ ios: "System", android: "sans-serif-medium" }),
    semiBold: Platform.select({ ios: "System", android: "sans-serif" }),
    bold: Platform.select({ ios: "System", android: "sans-serif-bold" }),
  },
}

export const typography = {
  fonts,
  /**
   * Основной шрифт для всего русского текста
   */
  primary: fonts.playpen,
  /**
   * Cherry Bomb для логотипа "Life Flow" и заголовков
   */
  cherry: fonts.cherry,
  /**
   * Резервный системный шрифт
   */
  secondary: fonts.system,
  /**
   * Моноширинный шрифт
   */
  code: Platform.select({ ios: "Courier", android: "monospace" }),
}
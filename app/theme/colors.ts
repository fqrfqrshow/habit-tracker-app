const palette = {
  neutral100: "#FFFFFF",
  neutral200: "#F0F8FF",  // Alice Blue
  neutral300: "#E6F3FF",  // Очень светлый голубой
  neutral400: "#B6D0E2",  // Светлый голубой
  neutral500: "#87CEEB",  // Sky Blue
  neutral600: "#4682B4",  // Steel Blue
  neutral700: "#1E90FF",  // Dodger Blue
  neutral800: "#000080",  // Navy
  neutral900: "#00008B",  // Dark Blue

  primary100: "#E6F3FF",  // Очень светлый голубой
  primary200: "#B3D9FF",  // Светлый голубой
  primary300: "#80BFFF",  // Голубой
  primary400: "#4DA6FF",  // Яркий голубой
  primary500: "#1A8CFF",  // Основной синий
  primary600: "#0073E6",  // Темный синий

  secondary100: "#F0F8FF",  // Alice Blue
  secondary200: "#D4EFFF",  // Светлый голубой
  secondary300: "#A7D8FF",  // Голубой
  secondary400: "#7AB8FF",  // Средний голубой
  secondary500: "#4D94FF",  // Второстепенный синий

  accent100: "#FFF0F5",  
  accent200: "#FFD1DC",  
  accent300: "#FFA8BA",  
  accent400: "#ea84a8ff",  
  accent500: "#ef99b3ff",  // Яркий розовый

  angry100: "#FFE6E6",
  angry500: "#FF3333",

  success: "#56C568",

  overlay20: "rgba(0, 56, 112, 0.2)",
  overlay50: "rgba(0, 56, 112, 0.5)",
} as const

export const colors = {
  palette,
  transparent: "rgba(0, 0, 0, 0)",
  text: palette.neutral800,        // Темно-синий текст
  textDim: palette.neutral600,     // Steel Blue
  background: palette.neutral200,  // Alice Blue фон
  border: palette.neutral400,      // Светлый голубой границы
  tint: palette.primary500,        // Основной синий
  separator: palette.neutral300,   // Очень светлый голубой разделители
  error: palette.angry500,         // Красный для ошибок
  errorBackground: palette.angry100,
  success: palette.success,
}
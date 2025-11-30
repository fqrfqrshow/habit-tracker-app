import React from 'react'
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native'

interface ToggleProps {
  value: boolean
  onValueChange: (value: boolean) => void
  variant?: string
  inputInnerStyle?: ViewStyle
  inputOuterStyle?: ViewStyle
  disabled?: boolean
}

export const Toggle = ({ 
  value, 
  onValueChange, 
  variant, 
  inputInnerStyle, 
  inputOuterStyle,
  disabled = false 
}: ToggleProps) => {
  
  // Определяем стили в зависимости от варианта
  const getContainerStyle = () => {
    if (variant === 'switch') {
      return [
        styles.switchContainer,
        value ? styles.activeSwitchContainer : styles.inactiveSwitchContainer,
        inputOuterStyle
      ]
    }
    // Для других вариантов или по умолчанию
    return [
      styles.defaultContainer,
      value ? styles.activeDefaultContainer : styles.inactiveDefaultContainer,
      inputOuterStyle
    ]
  }

  const getCircleStyle = () => {
    if (variant === 'switch') {
      return [
        styles.switchCircle,
        value ? styles.activeSwitchCircle : styles.inactiveSwitchCircle,
        inputInnerStyle
      ]
    }
    return [
      styles.defaultCircle,
      value ? styles.activeDefaultCircle : styles.inactiveDefaultCircle,
      inputInnerStyle
    ]
  }

  return (
    <TouchableOpacity
      style={getContainerStyle()}
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
    >
      <View style={getCircleStyle()} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  // Стили для switch варианта
  switchContainer: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: 'center',
  },
  activeSwitchContainer: {
    backgroundColor: '#4ECDC4',
  },
  inactiveSwitchContainer: {
    backgroundColor: '#f0f0f0',
  },
  switchCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'white',
  },
  activeSwitchCircle: {
    alignSelf: 'flex-end',
  },
  inactiveSwitchCircle: {
    alignSelf: 'flex-start',
  },

  // Стили для default варианта
  defaultContainer: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: 'center',
  },
  activeDefaultContainer: {
    backgroundColor: '#4ECDC4',
  },
  inactiveDefaultContainer: {
    backgroundColor: '#f0f0f0',
  },
  defaultCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'white',
  },
  activeDefaultCircle: {
    alignSelf: 'flex-end',
  },
  inactiveDefaultCircle: {
    alignSelf: 'flex-start',
  },
})

export default Toggle
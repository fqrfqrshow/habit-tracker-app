import React, { useState, ReactNode } from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
]

interface ColorPickerProps {
  value: string
  onComplete: (color: { hex: string }) => void
  children?: ReactNode
  style?: any
}

export const SimpleColorPicker = ({ value, onComplete, children, style }: ColorPickerProps) => {
  const [selectedColor, setSelectedColor] = useState(value)

  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    onComplete({ hex: color })
  }

  return (
    <View style={[styles.container, style]}>
      {children ? (
        // Если есть children, показываем их (для совместимости)
        children
      ) : (
        // Иначе показываем нашу простую палитру
        <>
          {colors.map((color, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.colorItem,
                { backgroundColor: color },
                selectedColor === color && styles.selectedColor
              ]}
              onPress={() => handleColorSelect(color)}
            />
          ))}
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 10,
  },
  colorItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#000',
    borderWidth: 3,
  },
})

// Простые заглушки без Text
export const HueSlider = () => <View style={{ height: 20, marginVertical: 10 }} />
export const Panel1 = () => <View style={{ height: 100, marginVertical: 10 }} />
export const Preview = ({ hideInitialColor }: { hideInitialColor?: boolean }) => (
  <View style={{ height: 50, marginVertical: 10 }} />
)

export default SimpleColorPicker
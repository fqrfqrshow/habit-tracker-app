import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { View, TouchableOpacity, StyleSheet, Modal } from 'react-native'
import { Icon } from 'app/components'
import { colors, spacing } from 'app/theme'

// Простой BottomSheetModal
export const SimpleBottomSheetModal = forwardRef(({ 
  children, 
  snapPoints, 
  backdropComponent, 
  style,
  onDismiss 
}: any, ref) => {
  const [visible, setVisible] = useState(false)

  useImperativeHandle(ref, () => ({
    present: () => setVisible(true),
    close: () => {
      setVisible(false)
      onDismiss?.()
    },
    dismiss: () => {
      setVisible(false)
      onDismiss?.()
    },
  }))

  const handleClose = () => {
    setVisible(false)
    onDismiss?.()
  }

  const BackdropComponent = backdropComponent || (() => (
    <TouchableOpacity 
      style={styles.backdrop} 
      activeOpacity={1} 
      onPress={handleClose}
    />
  ))

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <BackdropComponent />
      <View style={[styles.modalContainer, style]}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Icon icon="x" size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.handle} />
        {children}
      </View>
    </Modal>
  )
})

// Простой BottomSheetView
export const SimpleBottomSheetView = ({ children, style }: any) => (
  <View style={[styles.sheetContent, style]}>{children}</View>
)

// Простой BottomSheetBackdrop
export const SimpleBottomSheetBackdrop = ({ 
  disappearsOnIndex, 
  appearsOnIndex, 
  onPress,
  ...props 
}: any) => (
  <TouchableOpacity 
    style={styles.backdrop} 
    activeOpacity={1} 
    onPress={onPress}
    {...props}
  />
)

// Простой BottomSheetModalProvider
export const SimpleBottomSheetModalProvider = ({ children }: any) => (
  <View style={styles.flex}>{children}</View>
)

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.md,
    maxHeight: '80%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheetContent: {
    flex: 1,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: spacing.xs,
    marginBottom: spacing.xs,
  },
})

export default SimpleBottomSheetModal
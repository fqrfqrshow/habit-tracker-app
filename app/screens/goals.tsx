// D:\Университет\234\habit-tracker-app\app\screens\goals.tsx
import { observer } from "mobx-react-lite"
import React, { FC, useState, useEffect } from "react"
import { View, ViewStyle, TouchableOpacity, ScrollView, TextStyle } from "react-native"
import { Text, Screen, Button, TextField } from "app/components"
import { colors, spacing } from "app/theme"
import { rootStore } from "app/models"
import { MaterialIcons } from "@expo/vector-icons"

// Типы для TypeScript безопасности
interface Goal {
  id: string
  title: string
  description: string
  target: number
  targetDate: Date
  progress: number
  tasks: any[]
}

interface ProductivityStats {
  completedTasks: number
  taskCompletionRate: number
  completedGoals: number
}

export const GoalsScreen: FC = observer(function GoalsScreen() {
  const { taskStore } = rootStore
  
  // Состояния UI
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [newGoalTitle, setNewGoalTitle] = useState("")
  const [newGoalDescription, setNewGoalDescription] = useState("")
  const [selectedDeadline, setSelectedDeadline] = useState<string>("30")
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null)

  // Состояния данных
  const [productivity, setProductivity] = useState<ProductivityStats>({ 
    completedTasks: 0, 
    taskCompletionRate: 0, 
    completedGoals: 0 
  })
  const [recommendedSchedule, setRecommendedSchedule] = useState<any[]>([])
  const [safeGoals, setSafeGoals] = useState<Goal[]>([])

  // Модалка для добавления задачи (кросс-платформенно)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [currentGoalId, setCurrentGoalId] = useState<string | null>(null)

  // Модалка подтверждения удаления цели (кросс-платформенно)
  const [confirmDeleteGoal, setConfirmDeleteGoal] = useState<{ id: string; title: string } | null>(null)

  // Загрузка данных
  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    try {
      // Получаем цели из store, НЕ генерируем случайный id
      const storeGoals = taskStore.goals || []
      const formattedGoals: Goal[] = storeGoals.map((goal: any) => ({
        id: goal.id,
        title: goal.title || "Без названия",
        description: goal.description || "",
        target: goal.target || 1,
        targetDate: goal.targetDate ? new Date(goal.targetDate) : new Date(),
        progress: calculateGoalProgress(goal),
        tasks: Array.isArray(goal.tasks) ? goal.tasks : [],
      }))
      setSafeGoals(formattedGoals)

      // Статистика
      const stats = taskStore.getProductivityStats?.()
      setProductivity({
        completedTasks: stats?.completedTasks ?? 0,
        taskCompletionRate: stats?.taskCompletionRate ?? 0,
        completedGoals: stats?.completedGoals ?? 0,
      })

      // Рекомендации
      const schedule = taskStore.getRecommendedSchedule?.()
      setRecommendedSchedule(Array.isArray(schedule) ? schedule : [])
    } catch {
      setSafeGoals([])
      setProductivity({ completedTasks: 0, taskCompletionRate: 0, completedGoals: 0 })
      setRecommendedSchedule([])
    }
  }

  const calculateGoalProgress = (goal: any): number => {
    if (!goal.tasks || goal.tasks.length === 0) return 0
    const completedTasks = goal.tasks.filter((task: any) => task.completed).length
    const totalTasks = goal.tasks.length
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  }

  // Добавление новой цели (синхронно)
  const handleAddGoal = () => {
    if (!newGoalTitle.trim()) return
    const daysToAdd = parseInt(selectedDeadline)
    const targetDate = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000)
    taskStore.addGoal?.({
      title: newGoalTitle.trim(),
      description: newGoalDescription.trim(),
      target: 1,
      targetDate,
    })
    loadData()
    setNewGoalTitle("")
    setNewGoalDescription("")
    setSelectedDeadline("30")
    setShowAddGoal(false)
  }

  // Открыть подтверждение удаления цели
  const handleDeleteGoal = (goalId: string, goalTitle: string) => {
    setConfirmDeleteGoal({ id: goalId, title: goalTitle })
  }

  // Подтвердить удаление цели (синхронно)
  const confirmDeleteGoalSubmit = () => {
    if (!confirmDeleteGoal) return
    taskStore.removeGoal?.(confirmDeleteGoal.id)
    setConfirmDeleteGoal(null)
    loadData()
  }

  // Отмена удаления цели
  const confirmDeleteGoalCancel = () => {
    setConfirmDeleteGoal(null)
  }

  // Открыть модалку добавления задачи
  const handleAddTaskOpen = (goalId: string) => {
    setCurrentGoalId(goalId)
    setNewTaskTitle("")
    setShowTaskModal(true)
  }

  // Сохранить задачу из модалки (синхронно)
  const handleAddTaskSubmit = () => {
    if (!newTaskTitle.trim() || !currentGoalId) return
    taskStore.addTaskToGoal?.(currentGoalId, {
      title: newTaskTitle.trim(),
      priority: "medium",
      estimatedTime: 30,
    })
    setShowTaskModal(false)
    setNewTaskTitle("")
    setCurrentGoalId(null)
    loadData()
  }

  // Завершить задачу из расписания
  const handleCompleteTask = (taskId: string) => {
    taskStore.completeTask?.(taskId)
    loadData()
  }

  // Переключение состояния задачи внутри цели
  const handleToggleTask = (taskId: string, completed: boolean) => {
    if (completed) taskStore.uncompleteTask?.(taskId)
    else taskStore.completeTask?.(taskId)
    loadData()
  }

  // Удаление задачи
  const handleRemoveTask = (taskId: string) => {
    taskStore.removeTask?.(taskId)
    loadData()
  }

  // Редактирование цели
  const handleEditGoal = (goal: Goal) => {
    setEditingGoalId(goal.id)
    setNewGoalTitle(goal.title)
    setNewGoalDescription(goal.description)
    setShowAddGoal(true)
  }

  // Обновление цели (синхронно)
  const handleUpdateGoal = () => {
    if (!newGoalTitle.trim() || !editingGoalId) return
    const daysToAdd = parseInt(selectedDeadline)
    const targetDate = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000)
    taskStore.updateGoal?.(editingGoalId, {
      title: newGoalTitle.trim(),
      description: newGoalDescription.trim(),
      targetDate,
    })
    loadData()
    setEditingGoalId(null)
    setNewGoalTitle("")
    setNewGoalDescription("")
    setSelectedDeadline("30")
    setShowAddGoal(false)
  }

  // Вспомогательные функции
  const getDeadlineText = (days: string) => {
    switch(days) {
      case "7": return "1 неделя"
      case "30": return "1 месяц"
      case "90": return "3 месяца"
      case "365": return "1 год"
      default: return `${days} дней`
    }
  }

  const formatDate = (date: Date | string): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      return dateObj.toLocaleDateString('ru-RU')
    } catch {
      return 'не указано'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return colors.palette.success
    if (progress >= 50) return colors.palette.accent500
    return colors.palette.primary600
  }

  return (
    <Screen preset="scroll" safeAreaEdges={["top", "bottom"]} contentContainerStyle={$container}>
      {/* 🎯 Вдохновляющий заголовок */}
      <View style={$headerContainer}>
        <View>
          <Text text="🎯 Ваши цели" preset="heading" />
          <Text text="Превратите мечты в реальность" style={$subtitle} />
        </View>
      </View>

      {/* 📊 Статистика продуктивности */}
      <View style={$statsContainer}>
        <View style={$statsHeader}>
          <Text text="📊 Ваш прогресс" preset="formLabel" />
          <Text text="Эта неделя" size="xs" style={{ color: colors.textDim }} />
        </View>
        <View style={$statsGrid}>
          <View style={$statItem}>
            <View style={$statIconContainer}>
              <MaterialIcons name="check-circle" size={20} color={colors.palette.primary600} />
            </View>
            <Text text={productivity.completedTasks.toString()} preset="heading" size="lg" />
            <Text text="выполнено задач" size="xs" style={{ color: colors.textDim }} />
          </View>
          <View style={$statItem}>
            <View style={$statIconContainer}>
              <MaterialIcons name="trending-up" size={20} color={colors.palette.accent500} />
            </View>
            <Text text={`${Math.round(productivity.taskCompletionRate)}%`} preset="heading" size="lg" />
            <Text text="успешность" size="xs" style={{ color: colors.textDim }} />
          </View>
          <View style={$statItem}>
            <View style={$statIconContainer}>
              <MaterialIcons name="flag" size={20} color={colors.palette.secondary500} />
            </View>
            <Text text={productivity.completedGoals.toString()} preset="heading" size="lg" />
            <Text text="достигнуто целей" size="xs" style={{ color: colors.textDim }} />
          </View>
        </View>
      </View>

      {/* 🧠 Интеллектуальное расписание */}
      {recommendedSchedule.length > 0 && (
        <View style={$section}>
          <View style={$sectionHeader}>
            <MaterialIcons name="schedule" size={20} color={colors.palette.primary600} />
            <Text text="🧠 Рекомендовано на сегодня" preset="formLabel" />
          </View>
          <ScrollView style={$scheduleList} horizontal showsHorizontalScrollIndicator={false}>
            {recommendedSchedule.map((task, index) => (
              <View key={task?.id || `task-${index}`} style={[
                $scheduleItem,
                task?.priority === 'high' && $highPriority,
                task?.priority === 'medium' && $mediumPriority
              ]}>
                <View style={$taskInfo}>
                  <Text text={task?.title || "Задача"} preset="formLabel" size="sm" />
                  <View style={$taskMeta}>
                    <Text 
                      text={`⏱ ${task?.estimatedTime || 0} мин`} 
                      size="xs" 
                      style={{ color: colors.textDim }} 
                    />
                    {task?.priority === 'high' && (
                      <Text text="🔴 Важно" size="xs" style={{ color: colors.palette.angry500 }} />
                    )}
                  </View>
                </View>
                <TouchableOpacity 
                  style={$completeButton}
                  onPress={() => task?.id && handleCompleteTask(task.id)}
                >
                  <MaterialIcons name="check" size={18} color={colors.palette.neutral100} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 🎯 Создание/редактирование цели */}
      {showAddGoal ? (
        <View style={$addGoalContainer}>
          <View style={$sectionHeader}>
            <MaterialIcons name={editingGoalId ? "edit" : "add-circle"} size={20} color={colors.palette.primary600} />
            <Text text={editingGoalId ? "✏️ Редактировать цель" : "🎯 Новая цель"} preset="formLabel" />
          </View>
          
          <TextField
            placeholder="Какую цель хотите достичь?"
            value={newGoalTitle}
            onChangeText={setNewGoalTitle}
            style={{ marginBottom: spacing.sm }}
          />
          
          <TextField
            placeholder="Опишите вашу цель подробнее..."
            value={newGoalDescription}
            onChangeText={setNewGoalDescription}
            multiline
            style={{ marginBottom: spacing.md, minHeight: 80 }}
          />
          
          <View style={$deadlineSection}>
            <Text text="Срок достижения:" preset="formLabel" size="sm" style={{ marginBottom: spacing.sm }} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={$deadlineScroll}>
              {["7", "30", "90", "365"].map((days) => (
                <TouchableOpacity
                  key={days}
                  style={[
                    $deadlineOption,
                    selectedDeadline === days && $deadlineOptionSelected
                  ]}
                  onPress={() => setSelectedDeadline(days)}
                >
                  <Text 
                    text={getDeadlineText(days)} 
                    size="sm" 
                    style={[
                      $deadlineText,
                      selectedDeadline === days && $deadlineTextSelected
                    ]} 
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <View style={$buttonRow}>
            <Button 
              text="Отмена" 
              onPress={() => {
                setShowAddGoal(false)
                setEditingGoalId(null)
                setNewGoalTitle("")
                setNewGoalDescription("")
              }}
              style={$cancelButton}
              preset="reversed"
            />
            <Button 
              text={editingGoalId ? "Обновить цель" : "Создать цель"} 
              onPress={editingGoalId ? handleUpdateGoal : handleAddGoal}
              style={$submitButton}
              LeftAccessory={() => (
                <MaterialIcons 
                  name={editingGoalId ? "save" : "rocket-launch"} 
                  size={16} 
                  color={colors.palette.neutral100} 
                />
              )}
            />
          </View>
        </View>
      ) : (
        <TouchableOpacity 
          style={$createGoalCard}
          onPress={() => setShowAddGoal(true)}
        >
          <View style={$createGoalContent}>
            <View style={$createGoalIcon}>
              <MaterialIcons name="add" size={24} color={colors.palette.primary600} />
            </View>
            <View style={$createGoalText}>
              <Text text="Начать новую цель" preset="formLabel" />
              <Text text="Создайте план и достигайте большего" size="sm" style={{ color: colors.textDim }} />
            </View>
            <MaterialIcons name="chevron-right" size={20} color={colors.textDim} />
          </View>
        </TouchableOpacity>
      )}

      {/* 📝 Список целей */}
      <View style={$goalsContainer}>
        <View style={$sectionHeader}>
          <MaterialIcons name="list-alt" size={20} color={colors.palette.primary600} />
          <Text text="📝 Активные цели" preset="formLabel" />
          <Text text={`${safeGoals.length}`} style={$goalsCount} />
        </View>
        
        {safeGoals.length === 0 ? (
          <View style={$emptyState}>
            <MaterialIcons name="flag" size={48} color={colors.palette.neutral400} />
            <Text text="Пока нет целей" preset="subheading" style={{ marginBottom: spacing.xs }} />
            <Text text="Создайте первую цель и начните свой путь к успеху!" style={{ color: colors.textDim, textAlign: 'center' }} />
          </View>
        ) : (
          safeGoals.map((goal) => (
            <View key={goal.id} style={$goalCard}>
              <View style={$goalHeader}>
                <View style={$goalTitleContainer}>
                  <MaterialIcons 
                    name="circle" 
                    size={16} 
                    color={getProgressColor(goal.progress)} 
                  />
                  <Text text={goal.title} preset="formLabel" size="md" style={$goalTitle} />
                </View>
                <View style={$goalActions}>
                  <TouchableOpacity 
                    style={$actionButton}
                    onPress={() => handleEditGoal(goal)}
                  >
                    <MaterialIcons name="edit" size={16} color={colors.textDim} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={$actionButton}
                    onPress={() => handleDeleteGoal(goal.id, goal.title)}
                  >
                    <MaterialIcons name="delete" size={16} color={colors.palette.angry500} />
                  </TouchableOpacity>
                </View>
              </View>
              
              {goal.description ? (
                <Text text={goal.description} size="sm" style={{ color: colors.textDim, marginBottom: spacing.sm }} />
              ) : null}
              
              <View style={$progressContainer}>
                <View style={$progressBar}>
                  <View 
                    style={[
                      $progressFill, 
                      { 
                        width: `${Math.min(goal.progress, 100)}%`,
                        backgroundColor: getProgressColor(goal.progress)
                      }
                    ]} 
                  />
                </View>
                <View style={$progressBadge}>
                  <Text text={`${goal.progress}%`} size="xs" style={$progressText} />
                </View>
              </View>

              {/* ✅ Задачи цели — интерактивный список */}
              {goal.tasks && goal.tasks.length > 0 ? (
                <View style={$tasksSection}>
                  <View style={$tasksHeader}>
                    <MaterialIcons name="task-alt" size={16} color={colors.palette.primary600} />
                    <Text text="Задачи" preset="formLabel" />
                    <Text 
                      text={`${goal.tasks.filter(t => t.completed).length}/${goal.tasks.length}`} 
                      size="xs" 
                      style={{ color: colors.textDim, marginLeft: 'auto' }} 
                    />
                  </View>

                  {goal.tasks.map((task) => (
                    <View key={task.id} style={$taskRow}>
                      <TouchableOpacity onPress={() => handleToggleTask(task.id, task.completed)} style={$taskCheck}>
                        <MaterialIcons
                          name={task.completed ? "check-circle" : "radio-button-unchecked"}
                          size={20}
                          color={task.completed ? colors.palette.success : colors.textDim}
                        />
                      </TouchableOpacity>
                      <View style={$taskContent}>
                        <Text text={task.title || "Задача"} size="sm" preset="formLabel" />
                        <View style={$taskRowMeta}>
                          {task.estimatedTime ? (
                            <Text text={`⏱ ${task.estimatedTime} мин`} size="xs" style={{ color: colors.textDim }} />
                          ) : null}
                          {task.priority === "high" && (
                            <Text text="🔴 Важно" size="xs" style={{ color: colors.palette.angry500 }} />
                          )}
                          {task.priority === "medium" && (
                            <Text text="🟠 Средний" size="xs" style={{ color: colors.palette.accent500 }} />
                          )}
                          {task.priority === "low" && (
                            <Text text="🟢 Низкий" size="xs" style={{ color: colors.textDim }} />
                          )}
                        </View>
                      </View>
                      <TouchableOpacity style={$taskDelete} onPress={() => handleRemoveTask(task.id)}>
                        <MaterialIcons name="delete" size={18} color={colors.palette.angry500} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={$tasksEmpty}>
                  <MaterialIcons name="assignment" size={20} color={colors.palette.neutral400} />
                  <Text text="Нет задач. Добавьте первую!" size="xs" style={{ color: colors.textDim, marginLeft: spacing.xs }} />
                </View>
              )}
              
              <View style={$goalFooter}>
                <View style={$goalMeta}>
                  <MaterialIcons name="date-range" size={14} color={colors.textDim} />
                  <Text 
                    text={`до ${formatDate(goal.targetDate)}`} 
                    size="xs" 
                    style={{ color: colors.textDim, marginLeft: 4 }} 
                  />
                  <Text 
                    text={`• ${goal.tasks?.length || 0} задач`} 
                    size="xs" 
                    style={{ color: colors.textDim, marginLeft: 8 }} 
                  />
                </View>
                <View style={$goalFooterActions}>
                  <TouchableOpacity 
                    style={$addTaskButton}
                    onPress={() => handleAddTaskOpen(goal.id)}
                  >
                    <MaterialIcons name="add-task" size={16} color={colors.palette.primary600} />
                    <Text text="Задача" size="xs" style={{ color: colors.palette.primary600, marginLeft: 4 }} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Кросс-платформенная модалка добавления задачи */}
      {showTaskModal && (
        <View style={$modalOverlay}>
          <View style={$modalCard}>
            <View style={$sectionHeader}>
              <MaterialIcons name="add-task" size={20} color={colors.palette.primary600} />
              <Text text="Новая задача" preset="formLabel" />
            </View>

            <TextField
              placeholder="Введите название задачи"
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              style={{ marginBottom: spacing.md }}
            />

            <View style={$buttonRow}>
              <Button 
                text="Отмена" 
                onPress={() => { setShowTaskModal(false); setNewTaskTitle(""); setCurrentGoalId(null) }} 
                style={$cancelButton} 
                preset="reversed" 
              />
              <Button 
                text="Добавить" 
                onPress={handleAddTaskSubmit} 
                style={$submitButton} 
                LeftAccessory={() => (
                  <MaterialIcons name="save" size={16} color={colors.palette.neutral100} />
                )} 
              />
            </View>
          </View>
        </View>
      )}

      {/* Кросс-платформенная модалка подтверждения удаления цели */}
      {confirmDeleteGoal && (
        <View style={$modalOverlay}>
          <View style={$modalCard}>
            <View style={$sectionHeader}>
              <MaterialIcons name="delete" size={20} color={colors.palette.angry500} />
              <Text text="Удалить цель" preset="formLabel" />
            </View>

            <Text
              text={`Удалить цель "${confirmDeleteGoal.title}"? Все связанные задачи будут удалены.`}
              size="sm"
              style={{ color: colors.textDim, marginBottom: spacing.md }}
            />

            <View style={$buttonRow}>
              <Button 
                text="Отмена" 
                onPress={confirmDeleteGoalCancel} 
                style={$cancelButton} 
                preset="reversed" 
              />
              <Button 
                text="Удалить" 
                onPress={confirmDeleteGoalSubmit} 
                style={{ ...$submitButton, backgroundColor: colors.palette.angry500 }} 
                LeftAccessory={() => (
                  <MaterialIcons name="delete-forever" size={16} color={colors.palette.neutral100} />
                )} 
              />
            </View>
          </View>
        </View>
      )}
    </Screen>
  )
})

// Стили
const $container: ViewStyle = {
  paddingHorizontal: spacing.lg,
  gap: spacing.xl,
  paddingBottom: 70,
}

const $headerContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "flex-start",
  justifyContent: "space-between",
  marginTop: spacing.xs,
}

const $subtitle: TextStyle = {
  color: colors.textDim,
  marginTop: spacing.xs,
}

const $statsContainer: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  padding: spacing.lg,
  borderRadius: spacing.md,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  elevation: 3,
}

const $statsHeader: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.md,
}

const $statsGrid: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
}

const $statItem: ViewStyle = {
  alignItems: "center",
  gap: spacing.xs,
  flex: 1,
}

const $statIconContainer: ViewStyle = {
  backgroundColor: colors.palette.neutral200,
  padding: spacing.xs,
  borderRadius: spacing.xs,
  marginBottom: spacing.xs,
}

const $section: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  padding: spacing.lg,
  borderRadius: spacing.md,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  elevation: 3,
}

const $sectionHeader: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
  marginBottom: spacing.md,
}

const $scheduleList: ViewStyle = {
  flexDirection: "row",
}

const $scheduleItem: ViewStyle = {
  backgroundColor: colors.palette.neutral200,
  padding: spacing.md,
  borderRadius: spacing.sm,
  marginRight: spacing.sm,
  minWidth: 200,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
}

const $highPriority: ViewStyle = {
  borderLeftWidth: 4,
  borderLeftColor: colors.palette.angry500,
}

const $mediumPriority: ViewStyle = {
  borderLeftWidth: 4,
  borderLeftColor: colors.palette.accent500,
}

const $taskInfo: ViewStyle = {
  flex: 1,
}

const $taskMeta: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: spacing.xs,
}

const $completeButton: ViewStyle = {
  backgroundColor: colors.palette.primary600,
  width: 32,
  height: 32,
  borderRadius: 16,
  justifyContent: "center",
  alignItems: "center",
  marginLeft: spacing.sm,
}

const $addGoalContainer: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  padding: spacing.lg,
  borderRadius: spacing.md,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  elevation: 3,
}

const $deadlineSection: ViewStyle = {
  marginBottom: spacing.md,
}

const $deadlineScroll: ViewStyle = {
  flexDirection: "row",
}

const $deadlineOption: ViewStyle = {
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderRadius: 20,
  backgroundColor: colors.palette.neutral200,
  marginRight: spacing.sm,
}

const $deadlineOptionSelected: ViewStyle = {
  backgroundColor: colors.palette.primary600,
}

const $deadlineText: TextStyle = {
  color: colors.text,
}

const $deadlineTextSelected: TextStyle = {
  color: colors.palette.neutral100,
}

const $buttonRow: ViewStyle = {
  flexDirection: "row",
  gap: spacing.sm,
}

const $cancelButton: ViewStyle = {
  flex: 1,
  backgroundColor: colors.palette.neutral300,
}

const $submitButton: ViewStyle = {
  flex: 2,
  backgroundColor: colors.palette.primary600,
}

const $createGoalCard: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  padding: spacing.lg,
  borderRadius: spacing.md,
  borderWidth: 2,
  borderColor: colors.palette.neutral300,
  borderStyle: "dashed",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  elevation: 3,
}

const $createGoalContent: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.md,
}

const $createGoalIcon: ViewStyle = {
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: colors.palette.primary100,
  justifyContent: "center",
  alignItems: "center",
}

const $createGoalText: ViewStyle = {
  flex: 1,
}

const $goalsContainer: ViewStyle = {
  gap: spacing.md,
}

const $goalsCount: TextStyle = {
  backgroundColor: colors.palette.primary600,
  color: colors.palette.neutral100,
  paddingHorizontal: spacing.sm,
  paddingVertical: 2,
  borderRadius: 10,
  fontSize: 12,
  marginLeft: "auto",
}

const $emptyState: ViewStyle = {
  alignItems: "center",
  paddingVertical: spacing.xl,
  paddingHorizontal: spacing.lg,
  backgroundColor: colors.palette.neutral100,
  borderRadius: spacing.md,
}

const $goalCard: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  padding: spacing.lg,
  borderRadius: spacing.md,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  elevation: 3,
}

const $goalHeader: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: spacing.xs,
}

const $goalTitleContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  flex: 1,
  gap: spacing.sm,
}

const $goalTitle: TextStyle = {
  flex: 1,
}

const $goalActions: ViewStyle = {
  flexDirection: "row",
  gap: spacing.xs,
}

const $actionButton: ViewStyle = {
  padding: spacing.xs,
  borderRadius: 4,
}

const $progressContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
  marginBottom: spacing.sm,
}

const $progressBar: ViewStyle = {
  flex: 1,
  height: 8,
  backgroundColor: colors.palette.neutral300,
  borderRadius: 4,
  overflow: "hidden",
}

const $progressFill: ViewStyle = {
  height: "100%",
  borderRadius: 4,
}

const $progressBadge: ViewStyle = {
  backgroundColor: colors.palette.primary100,
  paddingHorizontal: spacing.sm,
  paddingVertical: 2,
  borderRadius: 12,
}

const $progressText: TextStyle = {
  color: colors.palette.primary600,
  fontWeight: "bold",
}

const $goalFooter: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
}

const $goalMeta: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const $goalFooterActions: ViewStyle = {
  flexDirection: "row",
  gap: spacing.sm,
}

const $addTaskButton: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  backgroundColor: colors.palette.primary100,
  borderRadius: 6,
}

/* ==== Секция задач внутри карточки цели ==== */
const $tasksSection: ViewStyle = {
  marginTop: spacing.sm,
  gap: spacing.xs,
}

const $tasksHeader: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
  marginBottom: spacing.xs,
}

const $tasksEmpty: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.sm,
  backgroundColor: colors.palette.neutral200,
  borderRadius: spacing.sm,
  marginBottom: spacing.sm,
}

const $taskRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.palette.neutral100,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderRadius: spacing.sm,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 2,
  elevation: 2,
  marginBottom: spacing.xs,
}

const $taskCheck: ViewStyle = {
  padding: spacing.xs,
  borderRadius: 16,
}

const $taskContent: ViewStyle = {
  flex: 1,
  marginLeft: spacing.xs,
}

const $taskRowMeta: ViewStyle = {
  flexDirection: "row",
  gap: spacing.sm,
  marginTop: 2,
  alignItems: "center",
}

const $taskDelete: ViewStyle = {
  padding: spacing.xs,
  borderRadius: 6,
}

/* ==== Кросс-платформенные модалки ==== */
const $modalOverlay: ViewStyle = {
  position: "absolute",
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: "rgba(0,0,0,0.35)",
  justifyContent: "center",
  alignItems: "center",
  padding: spacing.lg,
}

const $modalCard: ViewStyle = {
  width: "100%",
  maxWidth: 480,
  backgroundColor: colors.palette.neutral100,
  borderRadius: spacing.md,
  padding: spacing.lg,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 8,
  elevation: 8,
}

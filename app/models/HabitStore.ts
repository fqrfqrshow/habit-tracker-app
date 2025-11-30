import { makeAutoObservable, runInAction } from "mobx"
import { scheduleHabitNotification, cancelHabitNotification } from "app/utils/notifications"
import { save, load } from "app/utils/storage"

// Тип привычки
export interface HabitType {
  id: string
  name: string              // ✅ название привычки
  description?: string
  category: string
  frequency: string[]       // ✅ массив дней недели, например ["Пн","Ср","Пт"]
  goal?: number             // цель (например, количество повторений)
  streak: number
  reminderTime?: string
  color: string
  emoji: string             // ✅ эмодзи привычки
  time?: string             // ✅ время выполнения
  createdAt: Date
  updatedAt: Date
  completionsByDate?: Record<string, boolean> // ключ: "YYYY-MM-DD"
}

export class HabitStore {
  habits: HabitType[] = []
  isLoading = false
  rootStore: any

  constructor(rootStore: any) {
    this.rootStore = rootStore
    makeAutoObservable(this)
  }

  // helper для даты
  private formatDate(date: Date): string {
    const y = date.getFullYear()
    const m = `${date.getMonth() + 1}`.padStart(2, "0")
    const d = `${date.getDate()}`.padStart(2, "0")
    return `${y}-${m}-${d}`
  }

  // Загрузка привычек из AsyncStorage
  loadHabits = async () => {
    this.isLoading = true
    try {
      const data = await load<HabitType[]>("habits")
      runInAction(() => {
        this.habits = (data ?? []).map(h => ({
          ...h,
          completionsByDate: h.completionsByDate ?? {},
        }))
        this.isLoading = false
      })
    } catch (error) {
      console.error("Error loading habits:", error)
      runInAction(() => {
        this.isLoading = false
      })
    }
  }

  // Сохранение всех привычек
  saveAll = async () => {
    try {
      await save("habits", this.habits)
    } catch (error) {
      console.error("Error saving habits:", error)
    }
  }

  // Переключение выполнения привычки на конкретную дату
  toggleHabitCompletionForDate = async (habitId: string, date: Date) => {
    const habit = this.habits.find(h => h.id === habitId)
    if (!habit) return

    const key = this.formatDate(date)
    const current = habit.completionsByDate?.[key] ?? false

    runInAction(() => {
      habit.completionsByDate = { ...(habit.completionsByDate ?? {}), [key]: !current }
      habit.streak = !current ? habit.streak + 1 : Math.max(0, habit.streak - 1)
      habit.updatedAt = new Date()
    })

    await this.saveAll()
  }

  // Удаление привычки
  deleteHabit = async (habitId: string) => {
    const habitIndex = this.habits.findIndex(h => h.id === habitId)
    if (habitIndex !== -1) {
      this.habits.splice(habitIndex, 1)
      cancelHabitNotification(habitId)
      await this.saveAll()
    }
  }

  // Создание привычки
  async createHabit(
    habitData: Omit<HabitType, "id" | "streak" | "createdAt" | "updatedAt" | "completionsByDate">
  ) {
    this.isLoading = true
    try {
      const newHabit: HabitType = {
        ...habitData,
        id: Date.now().toString(),
        streak: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        completionsByDate: {},
      }

      runInAction(() => {
        this.habits.push(newHabit)
      })

      if (habitData.reminderTime) {
  await scheduleHabitNotification({
    id: newHabit.id,
    title: newHabit.name,            // ✅ title берём из name
    reminderTime: newHabit.reminderTime,
  })
}


      await this.saveAll()
      console.log("✅ Привычка создана:", newHabit.name)
      return newHabit
    } catch (error) {
      console.error("Ошибка создания привычки:", error)
      throw error
    } finally {
      runInAction(() => {
        this.isLoading = false
      })
    }
  }

  // Отметка выполнения привычки (увеличение счётчика)
  async completeHabit(habitId: string, date: Date) {
    try {
      const habitIndex = this.habits.findIndex(h => h.id === habitId)
      if (habitIndex === -1) return

      const key = this.formatDate(date)

      runInAction(() => {
        const habit = this.habits[habitIndex]
        habit.completionsByDate = { ...(habit.completionsByDate ?? {}), [key]: true }
        habit.streak += 1
        habit.updatedAt = new Date()
      })

      await this.saveAll()
      console.log("✅ Привычка выполнена:", this.habits[habitIndex].name)
    } catch (error) {
      console.error("Ошибка выполнения привычки:", error)
    }
  }

  // Получение привычки по ID
  getHabitById(id: string): HabitType | undefined {
    return this.habits.find(h => h.id === id)
  }

  // Статистика привычек
  getHabitStats() {
    const total = this.habits.length
    const todayKey = this.formatDate(new Date())
    const completedToday = this.habits.filter(h => !!h.completionsByDate?.[todayKey]).length
    const totalCompletions = this.habits.reduce(
      (sum, h) => sum + Object.values(h.completionsByDate ?? {}).filter(Boolean).length,
      0
    )
    const completionRate = total > 0 ? (completedToday / total) * 100 : 0

    return {
      total,
      completedToday,
      totalCompletions,
      completionRate: Math.round(completionRate),
    }
  }

  // Очистка всех данных
  async clearAllData() {
    runInAction(() => {
      this.habits = []
    })
    await this.saveAll()
  }
}

import { makeAutoObservable, runInAction } from "mobx"
import { save, load } from "app/utils/storage"

export interface ProgressData {
  date: string
  habitsCompleted: number
  tasksCompleted: number
  mood?: number
}

export class ProgressStore {
  rootStore: any
  progressData: ProgressData[] = []

  constructor(rootStore: any) {
    this.rootStore = rootStore
    makeAutoObservable(this)
    this.loadProgress()
  }

  /** Загрузка прогресса из AsyncStorage */
  async loadProgress() {
    try {
      const data = await load<ProgressData[]>("progressData")
      if (data) {
        runInAction(() => {
          this.progressData = data
        })
        console.log("✅ Прогресс загружен")
      }
    } catch (error) {
      console.log("❌ Ошибка загрузки прогресса:", error)
    }
  }

  /** Сохранение прогресса */
  async saveProgress() {
    try {
      await save("progressData", this.progressData)
      console.log("✅ Прогресс сохранён")
    } catch (error) {
      console.error("Ошибка сохранения прогресса:", error)
    }
  }

  /** Добавление записи прогресса */
  addProgress(data: ProgressData) {
    this.progressData.push(data)
    this.saveProgress()
  }

  /** Получение прогресса за конкретную дату */
  getProgressForDate(date: string): ProgressData | undefined {
    return this.progressData.find(progress => progress.date === date)
  }

  /** Получение прогресса за последнюю неделю */
  getWeeklyProgress(): ProgressData[] {
    return this.progressData.slice(-7)
  }

  /** Очистка всех данных */
  async clearProgress() {
    runInAction(() => {
      this.progressData = []
    })
    await this.saveProgress()
  }
}

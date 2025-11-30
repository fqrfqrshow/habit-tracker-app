import { makeAutoObservable, runInAction } from "mobx"

export interface TaskType {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: "low" | "medium" | "high"
  deadline?: Date
  createdAt: Date
  estimatedTime?: number
}

export interface GoalType {
  id: string
  title: string
  description?: string
  target: number
  current: number
  progress: number
  targetDate: Date
  completed: boolean
  createdAt: Date
  tasks: TaskType[]
}

export class TaskStore {
  tasks: TaskType[] = []
  goals: GoalType[] = []
  rootStore: any

  constructor(rootStore: any) {
    this.rootStore = rootStore
    makeAutoObservable(this)
  }

  // ✅ Добавление цели
  addGoal(goalData: Omit<GoalType, "id" | "current" | "progress" | "completed" | "createdAt" | "tasks">) {
    const newGoal: GoalType = {
      ...goalData,
      id: Date.now().toString(),
      current: 0,
      progress: 0,
      completed: false,
      createdAt: new Date(),
      tasks: []
    }
    this.goals.push(newGoal)
  }

  // ✅ Добавление задачи к цели
  addTaskToGoal(goalId: string, taskData: Omit<TaskType, "id" | "completed" | "createdAt">) {
    const goal = this.goals.find(g => g.id === goalId)
    if (goal) {
      const newTask: TaskType = {
        ...taskData,
        id: Date.now().toString(),
        completed: false,
        createdAt: new Date()
      }
      goal.tasks.push(newTask)
      this.tasks.push(newTask)
      this.updateGoalProgress(goalId)
    }
  }

  // ✅ Завершение задачи
  completeTask(taskId: string) {
    const task = this.tasks.find(t => t.id === taskId)
    if (task && !task.completed) {
      task.completed = true
      this.goals.forEach(goal => {
        const goalTask = goal.tasks.find(t => t.id === taskId)
        if (goalTask) {
          goalTask.completed = true
          goal.current = goal.tasks.filter(t => t.completed).length
          this.updateGoalProgress(goal.id)
        }
      })
    }
  }

  // ✅ Снятие отметки выполнения (если нужно)
  uncompleteTask(taskId: string) {
    const task = this.tasks.find(t => t.id === taskId)
    if (task && task.completed) {
      task.completed = false
      this.goals.forEach(goal => {
        const goalTask = goal.tasks.find(t => t.id === taskId)
        if (goalTask) {
          goalTask.completed = false
          goal.current = goal.tasks.filter(t => t.completed).length
          this.updateGoalProgress(goal.id)
        }
      })
    }
  }

  // ✅ Обновление прогресса цели
  private updateGoalProgress(goalId: string) {
    const goal = this.goals.find(g => g.id === goalId)
    if (goal) {
      const totalTasks = goal.tasks.length
      const completedTasks = goal.tasks.filter(t => t.completed).length
      goal.current = completedTasks
      goal.progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      goal.completed = goal.progress >= 100
    }
  }

  // ✅ Получение рекомендованного расписания
  getRecommendedSchedule() {
    return this.tasks
      .filter(task => !task.completed)
      .sort((a, b) => {
        const priorityWeight = { high: 3, medium: 2, low: 1 }
        return priorityWeight[b.priority] - priorityWeight[a.priority]
      })
      .slice(0, 5)
      .map(task => ({
        id: task.id,
        title: task.title,
        priority: task.priority,
        estimatedTime: task.estimatedTime || 30
      }))
  }

  // ✅ Получение статистики продуктивности
  getProductivityStats() {
    const totalTasks = this.tasks.length
    const completedTasks = this.tasks.filter(t => t.completed).length
    const totalGoals = this.goals.length
    const completedGoals = this.goals.filter(g => g.completed).length
    
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    const goalCompletionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0

    return {
      totalTasks,
      completedTasks,
      totalGoals,
      completedGoals,
      taskCompletionRate: Math.round(taskCompletionRate),
      goalCompletionRate: Math.round(goalCompletionRate),
    }
  }

  // ✅ Получение цели по ID
  getGoalById(goalId: string): GoalType | undefined {
    return this.goals.find(g => g.id === goalId)
  }

  // ✅ Удаление цели
  removeGoal(goalId: string) {
    const goalIndex = this.goals.findIndex(g => g.id === goalId)
    if (goalIndex !== -1) {
      const goalTasks = this.goals[goalIndex].tasks
      this.tasks = this.tasks.filter(task => !goalTasks.some(gt => gt.id === task.id))
      this.goals.splice(goalIndex, 1)
    }
  }

  // ✅ Удаление задачи
  removeTask(taskId: string) {
    this.tasks = this.tasks.filter(t => t.id !== taskId)
    this.goals.forEach(goal => {
      goal.tasks = goal.tasks.filter(t => t.id !== taskId)
      this.updateGoalProgress(goal.id)
    })
  }

  // ✅ Обновление задачи
  updateTask(taskId: string, updates: Partial<TaskType>) {
    const task = this.tasks.find(t => t.id === taskId)
    if (task) Object.assign(task, updates)
    this.goals.forEach(goal => {
      const goalTask = goal.tasks.find(t => t.id === taskId)
      if (goalTask) Object.assign(goalTask, updates)
      this.updateGoalProgress(goal.id)
    })
  }

  // ✅ Обновление цели
  updateGoal(goalId: string, updates: Partial<GoalType>) {
    const goal = this.goals.find(g => g.id === goalId)
    if (goal) {
      Object.assign(goal, updates)
      this.updateGoalProgress(goalId)
    }
  }

  // ✅ Получение всех невыполненных задач
  getPendingTasks(): TaskType[] {
    return this.tasks.filter(task => !task.completed)
  }

  // ✅ Получение задач по приоритету
  getTasksByPriority(priority: "low" | "medium" | "high"): TaskType[] {
    return this.tasks.filter(task => task.priority === priority)
  }

  // ✅ Получение целей с прогрессом
  getGoalsWithProgress(): GoalType[] {
    return this.goals.map(goal => ({
      ...goal,
      progress: goal.tasks.length > 0 
        ? Math.round((goal.tasks.filter(t => t.completed).length / goal.tasks.length) * 100) 
        : 0
    }))
  }

  // ✅ Очистка всех данных
  async clearData() {
    runInAction(() => {
      this.tasks = []
      this.goals = []
    })
  }
}

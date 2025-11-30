import { makeAutoObservable, runInAction } from "mobx"
import { load, save, remove } from "app/utils/storage"

export interface StoredUser {
  id: number
  name: string
  email: string
  createdAt: string
  bio?: string
  passwordHash: string
}

const AUTH_TOKEN_KEY = "userToken"
const AUTH_USER_KEY = "userData"
const USERS_COLLECTION_KEY = "usersCollection"

export class AuthStore {
  rootStore: any

  user: Omit<StoredUser, "passwordHash"> | null = null
  token: string | null = null
  isLoading = false
  error: string | null = null
  hydrated = false

  constructor(rootStore: any) {
    this.rootStore = rootStore
    makeAutoObservable(this)
    this.loadAuthData()
  }

  async loadAuthData() {
    try {
      const [savedToken, savedUser] = await Promise.all([
        load<string>(AUTH_TOKEN_KEY),
        load<StoredUser>(AUTH_USER_KEY)
      ])
      
      if (savedToken && savedUser) {
        runInAction(() => {
          this.token = savedToken
          const { passwordHash, ...userPublic } = savedUser
          this.user = userPublic
        })
      }
    } catch (error) {
      console.error("Error loading auth data:", error)
    } finally {
      runInAction(() => {
        this.hydrated = true
      })
    }
  }

  // Получить всех пользователей из хранилища
  private async getUsers(): Promise<StoredUser[]> {
    try {
      const users = await load<StoredUser[]>(USERS_COLLECTION_KEY)
      return users || []
    } catch (error) {
      return []
    }
  }

  // Сохранить всех пользователей в хранилище
  private async saveUsers(users: StoredUser[]): Promise<void> {
    await save(USERS_COLLECTION_KEY, users)
  }

  // НОВЫЙ МЕТОД: Обновление профиля пользователя
  async updateUserProfile(userData: { name?: string; email?: string; bio?: string }) {
    this.isLoading = true
    this.error = null
    
    try {
      console.log("📝 Обновление профиля:", userData)
      
      if (!this.user) {
        throw new Error("Пользователь не авторизован")
      }

      // Получаем всех пользователей
      const users = await this.getUsers()
      
      // Находим текущего пользователя в коллекции
      const userIndex = users.findIndex(u => u.id === this.user!.id)
      if (userIndex === -1) {
        throw new Error("Пользователь не найден в базе")
      }

      // Проверяем email на уникальность (если email меняется)
      if (userData.email && userData.email !== this.user.email) {
        const emailExists = users.some(u => u.email === userData.email && u.id !== this.user!.id)
        if (emailExists) {
          throw new Error("Пользователь с таким email уже существует")
        }
      }

      // Обновляем данные пользователя
      const updatedUser: StoredUser = {
        ...users[userIndex],
        name: userData.name ?? users[userIndex].name,
        email: userData.email ?? users[userIndex].email,
        bio: userData.bio ?? users[userIndex].bio
      }

      // Обновляем коллекцию пользователей
      users[userIndex] = updatedUser
      await this.saveUsers(users)

      // Обновляем текущую сессию
      await save(AUTH_USER_KEY, updatedUser)

      runInAction(() => {
        const { passwordHash, ...userPublic } = updatedUser
        this.user = userPublic
        this.error = null
      })

      console.log("✅ Профиль успешно обновлен:", this.user)
      
      return { success: true }
    } catch (error: any) {
      console.error("❌ Ошибка обновления профиля:", error.message)
      runInAction(() => { 
        this.error = error.message 
      })
      return { success: false, error: error.message }
    } finally {
      runInAction(() => { 
        this.isLoading = false 
      })
    }
  }

  // НОВЫЙ МЕТОД: Обновление данных пользователя (альтернативный метод)
  updateUserInfo = (userData: { name: string; email: string; bio: string }) => {
    if (!this.user) return

    runInAction(() => {
      if (this.user) {
        this.user.name = userData.name
        this.user.email = userData.email
        this.user.bio = userData.bio
      }
    })

    // Асинхронно сохраняем изменения в хранилище
    this.saveUpdatedUserToStorage()
  }

  // Приватный метод для сохранения обновленного пользователя в хранилище
  private async saveUpdatedUserToStorage() {
    if (!this.user) return

    try {
      const users = await this.getUsers()
      const userIndex = users.findIndex(u => u.id === this.user!.id)
      
      if (userIndex !== -1) {
        const updatedUser: StoredUser = {
          ...users[userIndex],
          name: this.user.name,
          email: this.user.email,
          bio: this.user.bio
        }

        users[userIndex] = updatedUser
        await this.saveUsers(users)
        await save(AUTH_USER_KEY, updatedUser)
        
        console.log("✅ Изменения сохранены в хранилище")
      }
    } catch (error) {
      console.error("❌ Ошибка сохранения в хранилище:", error)
    }
  }

  async login(email: string, password: string) {
    this.isLoading = true
    this.error = null
    
    try {
      console.log("🔐 Попытка входа для email:", email)
      
      // Ищем пользователя в коллекции
      const users = await this.getUsers()
      console.log("📋 Все пользователи в системе:", users)
      
      // Найдем пользователя по email (простое сравнение)
      const user = users.find(u => u.email === email)
      console.log("👤 Найденный пользователь:", user)
      
      if (!user) {
        throw new Error("Пользователь с таким email не найден")
      }

      // Проверяем пароль
      if (user.passwordHash !== password) {
        throw new Error("Неверный пароль")
      }

      const token = "mock_token_" + Date.now()
      
      // Сохраняем текущую сессию
      await Promise.all([
        save(AUTH_TOKEN_KEY, token),
        save(AUTH_USER_KEY, user)
      ])

      runInAction(() => {
        const { passwordHash, ...userPublic } = user
        this.user = userPublic
        this.token = token
        this.error = null
      })

      console.log("✅ Вход успешен, установлен пользователь:", this.user)
      
      return { success: true }
    } catch (error: any) {
      console.error("❌ Ошибка входа:", error.message)
      runInAction(() => { 
        this.error = error.message 
      })
      return { success: false, error: error.message }
    } finally {
      runInAction(() => { 
        this.isLoading = false 
      })
    }
  }

  async register(userData: { name: string; email: string; password: string; bio?: string }) {
    this.isLoading = true
    this.error = null
    
    try {
      console.log("📝 Регистрация нового пользователя:", userData)
      
      // Проверяем обязательные поля
      if (!userData.email) {
        throw new Error("Email обязателен")
      }
      if (!userData.password) {
        throw new Error("Пароль обязателен")
      }

      // Получаем всех существующих пользователей
      const users = await this.getUsers()
      
      // Проверяем, нет ли уже пользователя с таким email
      const existingUser = users.find(u => u.email === userData.email)
      if (existingUser) {
        throw new Error("Пользователь с таким email уже существует")
      }

      const newUser: StoredUser = {
        id: Date.now(),
        name: userData.name,
        email: userData.email,
        passwordHash: userData.password, // В реальном приложении нужно хешировать
        createdAt: new Date().toISOString(),
        bio: userData.bio
      }

      console.log("👤 Создаваемый пользователь:", newUser)

      // Добавляем нового пользователя в коллекцию
      const updatedUsers = [...users, newUser]
      await this.saveUsers(updatedUsers)

      const token = "mock_token_" + Date.now()
      
      // Сохраняем текущую сессию
      await Promise.all([
        save(AUTH_TOKEN_KEY, token),
        save(AUTH_USER_KEY, newUser)
      ])

      runInAction(() => {
        const { passwordHash, ...userPublic } = newUser
        this.user = userPublic
        this.token = token
        this.error = null
      })

      console.log("✅ Регистрация успешна, пользователь:", this.user)
      
      return { success: true }
    } catch (error: any) {
      console.error("❌ Ошибка регистрации:", error.message)
      runInAction(() => { 
        this.error = error.message 
      })
      return { success: false, error: error.message }
    } finally {
      runInAction(() => { 
        this.isLoading = false 
      })
    }
  }

  async logout() {
    console.log("🚪 Выход из системы")
    
    runInAction(() => {
      this.user = null
      this.token = null
      this.error = null
    })
    
    try {
      await Promise.all([
        remove(AUTH_TOKEN_KEY),
        remove(AUTH_USER_KEY)
      ])
      console.log("✅ Сессия очищена")
    } catch (error) {
      console.error("❌ Ошибка при выходе:", error)
    }
  }

  get isAuthenticated() {
    return !!this.user && !!this.token
  }

  // Метод для отладки - посмотреть всех пользователей
  async debugGetAllUsers() {
    const users = await this.getUsers()
    console.log("👥 Все пользователи в системе:", users)
    return users
  }

  // Метод для отладки - очистить всех пользователей
  async debugClearAllUsers() {
    await remove(USERS_COLLECTION_KEY)
    await remove(AUTH_TOKEN_KEY)
    await remove(AUTH_USER_KEY)
    
    runInAction(() => {
      this.user = null
      this.token = null
      this.error = null
    })
    
    console.log("🧹 Все пользователи и сессия очищены")
  }

  // Метод для принудительного создания тестового пользователя
  async debugCreateTestUser() {
    const testUser = {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      bio: "Test user"
    }
    
    return await this.register(testUser)
  }

  // Метод для создания пользователя с конкретным email
  async debugCreateUserWithEmail(email: string, password: string) {
    const testUser = {
      name: "User " + email,
      email: email,
      password: password,
      bio: "Test user"
    }
    
    return await this.register(testUser)
  }

  // Метод для прямого добавления пользователя в хранилище (обход регистрации)
  async debugDirectCreateUser(email: string, password: string) {
    try {
      const users = await this.getUsers()
      
      const newUser: StoredUser = {
        id: Date.now(),
        name: "Debug User",
        email: email,
        passwordHash: password,
        createdAt: new Date().toISOString(),
        bio: "Debug user"
      }

      users.push(newUser)
      await this.saveUsers(users)
      
      console.log("✅ Пользователь создан напрямую:", newUser)
      return { success: true, user: newUser }
    } catch (error: any) {
      console.error("❌ Ошибка прямого создания:", error)
      return { success: false, error: error.message }
    }
  }
}
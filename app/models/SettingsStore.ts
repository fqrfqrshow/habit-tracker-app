import { makeAutoObservable, runInAction } from "mobx"
import { save, load } from "app/utils/storage"

interface SettingsData {
  theme?: "light" | "dark"
  language?: string
  notificationsEnabled?: boolean
  vibrationEnabled?: boolean
  soundEnabled?: boolean
}

export class SettingsStore {
  rootStore: any
  theme: "light" | "dark" = "light"
  language = "ru"
  notificationsEnabled = true
  vibrationEnabled = true
  soundEnabled = true

  constructor(rootStore: any) {
    this.rootStore = rootStore
    makeAutoObservable(this)
    this.loadSettings()
  }

  /** Загрузка сохранённых настроек */
  async loadSettings() {
    try {
      const data = await load<SettingsData>("settings")
      if (data) {
        runInAction(() => {
          this.theme = data.theme ?? "light"
          this.language = data.language ?? "ru"
          this.notificationsEnabled = data.notificationsEnabled ?? true
          this.vibrationEnabled = data.vibrationEnabled ?? true
          this.soundEnabled = data.soundEnabled ?? true
        })
        console.log("✅ Настройки загружены")
      }
    } catch (error) {
      console.log("❌ Ошибка загрузки настроек:", error)
    }
  }

  /** Сохранение настроек */
  async saveSettings() {
    try {
      await save("settings", {
        theme: this.theme,
        language: this.language,
        notificationsEnabled: this.notificationsEnabled,
        vibrationEnabled: this.vibrationEnabled,
        soundEnabled: this.soundEnabled,
      })
      if (this.rootStore?.saveAll) {
        await this.rootStore.saveAll()
      }
      console.log("✅ Настройки сохранены")
    } catch (error) {
      console.error("Ошибка сохранения настроек:", error)
    }
  }

  setTheme(theme: "light" | "dark") {
    this.theme = theme
    this.saveSettings()
  }

  setLanguage(language: string) {
    this.language = language
    this.saveSettings()
  }

  setNotificationsEnabled(enabled: boolean) {
    this.notificationsEnabled = enabled
    this.saveSettings()
  }

  setVibrationEnabled(enabled: boolean) {
    this.vibrationEnabled = enabled
    this.saveSettings()
  }

  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled
    this.saveSettings()
  }

  /** Сброс настроек к дефолтным */
  async clearSettings() {
    runInAction(() => {
      this.theme = "light"
      this.language = "ru"
      this.notificationsEnabled = true
      this.vibrationEnabled = true
      this.soundEnabled = true
    })
    await this.saveSettings()
  }
}

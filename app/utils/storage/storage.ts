import AsyncStorage from "@react-native-async-storage/async-storage"

/**
 * Загружает строку из хранилища.
 *
 * @param key Ключ для получения.
 */
export async function loadString(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key)
  } catch (error) {
    console.error("Storage loadString error:", error)
    return null
  }
}

/**
 * Сохраняет строку в хранилище.
 *
 * @param key Ключ для сохранения.
 * @param value Значение для сохранения.
 */
export async function saveString(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value)
  } catch (error) {
    console.error("Storage saveString error:", error)
  }
}

/**
 * Загружает объект из хранилища и парсит его через JSON.parse.
 *
 * @param key Ключ для получения.
 */
export async function load<T>(key: string): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(key)
    if (!value) return null
    return JSON.parse(value) as T
  } catch (error) {
    console.error("Storage load error:", error)
    return null
  }
}

/**
 * Сохраняет объект в хранилище.
 *
 * @param key Ключ для сохранения.
 * @param value Значение для сохранения.
 */
export async function save(key: string, value: unknown): Promise<void> {
  try {
    if (value === null || value === undefined) {
      await AsyncStorage.removeItem(key)
    } else {
      await AsyncStorage.setItem(key, JSON.stringify(value))
    }
  } catch (error) {
    console.error("Storage save error:", error)
  }
}

/**
 * Удаляет элемент из хранилища.
 *
 * @param key Ключ для удаления.
 */
export async function remove(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key)
  } catch (error) {
    console.error("Storage remove error:", error)
  }
}

/**
 * Полностью очищает хранилище.
 */
export async function clear(): Promise<void> {
  try {
    await AsyncStorage.clear()
  } catch (error) {
    console.error("Storage clear error:", error)
  }
}

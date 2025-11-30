import AsyncStorage from "@react-native-async-storage/async-storage"

const PREFIX = "@habitapp"

const key = (k: string) => `${PREFIX}:${k}`

export async function save<T>(k: string, v: T) {
  try {
    const json = JSON.stringify(v)
    await AsyncStorage.setItem(key(k), json)
  } catch {}
}

export async function load<T>(k: string): Promise<T | undefined> {
  try {
    const json = await AsyncStorage.getItem(key(k))
    if (!json) return undefined
    return JSON.parse(json) as T
  } catch {
    return undefined
  }
}

export async function remove(k: string) {
  try {
    await AsyncStorage.removeItem(key(k))
  } catch {}
}

export async function saveString(k: string, v: string) {
  try {
    await AsyncStorage.setItem(key(k), v)
  } catch {}
}

export async function loadString(k: string) {
  try {
    return await AsyncStorage.getItem(key(k))
  } catch {
    return null
  }
}

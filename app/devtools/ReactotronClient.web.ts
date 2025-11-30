// Temporarily disabled Reactotron for Expo SDK 54 compatibility
export const Reactotron = {
  configure: () => ({
    use: () => this,
    useReactNative: () => this,
    setAsyncStorageHandler: () => this,
    onCustomCommand: () => this,
    connect: () => this,
    clear: () => {},
    log: () => {},
  }),
}
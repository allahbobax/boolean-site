/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface MinecraftLaunchOptions {
  username: string
  javaPath?: string
  ramMb?: number
  windowWidth?: number
  windowHeight?: number
  fullscreen?: boolean
  installPath?: string
}

interface MinecraftProgress {
  stage: string
  progress: number
  current?: string
  message?: string
}

interface MinecraftLaunchResult {
  success: boolean
  error?: string
  process?: any
}

interface Window {
  electron?: {
    minimize: () => void
    maximize: () => void
    close: () => void
    openExternal: (url: string) => void
    getAppPath: () => Promise<string>
    selectFolder: () => Promise<string | null>
    
    // Auto-update methods
    getAppVersion: () => Promise<string>
    checkForUpdates: () => Promise<{ success: boolean; updateInfo?: any; error?: string }>
    downloadUpdate: () => Promise<{ success: boolean; error?: string }>
    installUpdate: () => Promise<{ success: boolean }>
    
    // Minecraft Launcher
    launchMinecraft: (options: MinecraftLaunchOptions) => Promise<MinecraftLaunchResult>
    getLaunchDir: () => Promise<string>
    openLaunchFolder: () => Promise<{ success: boolean; path: string }>
    openFolderPath: (path: string) => Promise<{ success: boolean }>
    
    // Client Installer
    checkClientInstalled: () => Promise<{ installed: boolean }>
    checkModInstalled: () => Promise<{ installed: boolean; version?: string }>
    checkClientUpdate: (userId?: number) => Promise<any>
    installClient: (userId?: number) => Promise<any>
    installAndLaunchClient: (userId: number | undefined, options: MinecraftLaunchOptions) => Promise<MinecraftLaunchResult>
    launchClient: (options: MinecraftLaunchOptions) => Promise<MinecraftLaunchResult>
    getClientDirs: () => Promise<any>
    wipeClientData: () => Promise<{ success: boolean; deleted: string[]; errors: string[] }>
    
    ipcRenderer: {
      on: (channel: string, listener: (...args: any[]) => void) => void
      removeListener: (channel: string, listener: (...args: any[]) => void) => void
      send: (channel: string, ...args: any[]) => void
      invoke: (channel: string, ...args: any[]) => Promise<any>
    }
  }
}

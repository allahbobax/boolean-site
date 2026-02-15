export {}

declare global {
  interface Window {
    electron: {
      minimize: () => Promise<void>
      maximize: () => Promise<void>
      close: () => Promise<void>
      openExternal: (url: string) => Promise<void>
      getAppPath: () => Promise<string>
      selectFolder: () => Promise<string | null>
      
      // Auto-updater
      getAppVersion: () => Promise<string>
      checkForUpdates: () => Promise<any>
      downloadUpdate: () => Promise<void>
      installUpdate: () => Promise<void>
      
      // Minecraft Launcher
      launchMinecraft: (options: any) => Promise<any>
      getLaunchDir: () => Promise<string>
      openLaunchFolder: () => Promise<{ success: boolean; path: string }>
      openFolderPath: (path: string) => Promise<{ success: boolean }>
      
      // Client Installer
      checkClientInstalled: () => Promise<{ installed: boolean }>
      checkModInstalled: () => Promise<{ installed: boolean; version?: string }>
      checkClientUpdate: (userId?: number) => Promise<any>
      installClient: (userId?: number) => Promise<any>
      installAndLaunchClient: (userId: number | undefined, options: any) => Promise<any>
      launchClient: (options: any) => Promise<any>
      getClientDirs: () => Promise<any>
      wipeClientData: () => Promise<{ success: boolean; deleted: string[]; errors: string[] }>
      
      ipcRenderer: {
        on: (channel: string, listener: (event: any, ...args: any[]) => void) => void
        removeListener: (channel: string, listener: any) => void
        send: (channel: string, ...args: any[]) => void
        invoke: (channel: string, ...args: any[]) => Promise<any>
      }
    }
  }
}

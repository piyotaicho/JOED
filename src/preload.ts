// preload script for electron context isolation
/* eslint-env node */
import { contextBridge, ipcRenderer } from 'electron'
import type { ConfigLoadPayload, ConfigSavePayload, NedbHashPayload, NedbInsertPayload, NedbQueryPayload, NedbRemovePayload, NedbUpdatePayload } from './types/electron'


// Aboutで使用するバージョン文字列、Electron環境の確認にも用いる
contextBridge.exposeInMainWorld('Versions',
  {
    ApplicationName: () => process.env.VITE_APP_NAME,
    // APP_VERSIONの中継(Viteのdefineで埋め込み)
    ApplicationVersion: () => __APP_VERSION__ || 'undefined',
    // 以下はElectron環境でのみ有効
    Platform: () => process.platform,
    Electron: () => process.versions.electron,
    Node: () => process.versions.node,
    V8: () => process.versions.v8,
    Chrome: () => process.versions.chrome
  }
)

// IPC呼び出しのマッピング
const api = {
    // Renderer to main
    Insert: async (payload: NedbInsertPayload) => await ipcRenderer.invoke('Insert', payload),
    Find: async (payload: NedbQueryPayload) => await ipcRenderer.invoke('Find', payload),
    FindOne: async (payload: NedbQueryPayload) => await ipcRenderer.invoke('FindOne', payload),
    FindOneByHash: async (payload: NedbHashPayload) => await ipcRenderer.invoke('FindOneByHash', payload),
    Count: async (payload: NedbQueryPayload) => await ipcRenderer.invoke('Count', payload),
    Update: async (payload: NedbUpdatePayload) => await ipcRenderer.invoke('Update', payload),
    Remove: async (payload: NedbRemovePayload) => await ipcRenderer.invoke('Remove', payload),
    DropDatabase: async (payload: boolean) => await ipcRenderer.invoke('DropDatabase', payload),

    LoadConfig: async (payload: ConfigLoadPayload) => await ipcRenderer.invoke('LoadConfig', payload),
    SaveConfig: async (payload: ConfigSavePayload) => await ipcRenderer.invoke('SaveConfig', payload),

    GetSystemInfo: async () => await ipcRenderer.invoke('GetSystemInfo'),

    SwitchMenu: (payload: string) => ipcRenderer.send('SwitchMenu', payload),

    OpenURL: (payload: string) => ipcRenderer.send('OpenURL', payload),
    RelaunchApp: () => ipcRenderer.send('RelaunchApp'),

    // Main to renderer
    onChangeRouter: (callback: (event: Electron.IpcRendererEvent|unknown, routename: string) => void) => ipcRenderer.on('update-router', callback)
  }
contextBridge.exposeInMainWorld('API', api)
export type ElectronAPI = typeof api

// preload script for electron context isolation
/* eslint-env node */
/* eslint-disable @typescript-eslint/no-require-imports */
//
const { contextBridge, ipcRenderer } = require('electron')

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
contextBridge.exposeInMainWorld('API',
  {
    // Renderer to main
    Insert: async (payload: any) => await ipcRenderer.invoke('Insert', payload),
    Find: async (payload: any) => await ipcRenderer.invoke('Find', payload),
    FindOne: async (payload: any) => await ipcRenderer.invoke('FindOne', payload),
    // MIGRATION PROBLEM
    // IPCチャネル名が 'FineOneByHash' になっている(typo由来)ため互換維持で残置。
    // main側が将来 'FindOneByHash' に統一された場合、ここも同時変更が必要。
    FindOneByHash: async (payload: any) => await ipcRenderer.invoke('FineOneByHash', payload),
    Count: async (payload: any) => await ipcRenderer.invoke('Count', payload),
    Update: async (payload: any) => await ipcRenderer.invoke('Update', payload),
    Remove: async (payload: any) => await ipcRenderer.invoke('Remove', payload),
    DropDatabase: async (payload: any) => await ipcRenderer.invoke('DropDatabase', payload),

    LoadConfig: async (payload: any) => await ipcRenderer.invoke('LoadConfig', payload),
    SaveConfig: async (payload: any) => await ipcRenderer.invoke('SaveConfig', payload),

    GetSystemInfo: async (payload: any) => await ipcRenderer.invoke('GetSystemInfo', payload),

    SwitchMenu: (payload: any) => ipcRenderer.send('SwitchMenu', payload),

    OpenURL: (payload: any) => ipcRenderer.send('OpenURL', payload),
    RelaunchApp: () => ipcRenderer.send('RelaunchApp'),

    // Main to renderer
    onChangeRouter: (callback: any) => ipcRenderer.on('update-router', callback)
  }
)

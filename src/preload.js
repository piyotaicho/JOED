// preload script for electron context isolation
/* eslint-env node */
/* eslint-disable @typescript-eslint/no-require-imports */
//
const { contextBridge, ipcRenderer } = require('electron')

// Aboutで使用するバージョン文字列、Electron環境の確認にも用いる
contextBridge.exposeInMainWorld('Versions',
  {
    ApplicationName: () => process.env.VITE_APP_NAME,
    ApplicationVersion: () => process.env.VITE_APP_VERSION,
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
    Insert: async (payload) => await ipcRenderer.invoke('Insert', payload),
    Find: async (payload) => await ipcRenderer.invoke('Find', payload),
    FindOne: async (payload) => await ipcRenderer.invoke('FindOne', payload),
    FindOneByHash: async (payload) => await ipcRenderer.invoke('FineOneByHash', payload),
    Count: async (payload) => await ipcRenderer.invoke('Count', payload),
    Update: async (payload) => await ipcRenderer.invoke('Update', payload),
    Remove: async (payload) => await ipcRenderer.invoke('Remove', payload),
    DropDatabase: async (payload) => await ipcRenderer.invoke('DropDatabase', payload),

    LoadConfig: async (payload) => await ipcRenderer.invoke('LoadConfig', payload),
    SaveConfig: async (payload) => await ipcRenderer.invoke('SaveConfig', payload),

    GetSystemInfo: async (payload) => await ipcRenderer.invoke('GetSystemInfo', payload),

    SwitchMenu: (payload) => ipcRenderer.send('SwitchMenu', payload),

    OpenURL: (payload) => ipcRenderer.send('OpenURL', payload),
    RelaunchApp: () => ipcRenderer.send('RelaunchApp'),

    // Main to renderer
    onChangeRouter: (callback) => ipcRenderer.on('update-router', callback)
  }
)

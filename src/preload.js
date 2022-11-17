// preload script
//
import { contextBridge, ipcRenderer } from 'electron'

// Aboutで使用するバージョン文字列、Electron環境の確認にも用いる
contextBridge.exposeInMainWorld('Versions',
  {
    ApplicationName: () => process.env.VUE_APP_NAME,
    ApplicationVersion: () => process.env.VUE_APP_VERSION,
    Plathome: () => process.platform,
    Electron: () => process.versions.electron,
    Node: () => process.versions.node,
    V8: () => process.versions.v8,
    Chrome: () => process.versions.chrome
  }
)

// IPC呼び出しのマッピング
contextBridge.exposeInMainWorld('IPC',
  {
    // Renderer to main
    Insert: (payload) => ipcRenderer.invoke('Insert', payload),
    Find: (payload) => ipcRenderer.invoke('Find', payload),
    FindOne: (payload) => ipcRenderer.invoke('FindOne', payload),
    FindOneByHash: (payload) => ipcRenderer.invoke('FineOneByHash', payload),
    Count: (payload) => ipcRenderer.invoke('Count', payload),
    Update: (payload) => ipcRenderer.invoke('Update', payload),
    Remove: (payload) => ipcRenderer.invoke('Remove', payload),

    LoadConfig: (payload) => ipcRenderer.invoke('LoadConfig', payload),
    SaveConfig: (payload) => ipcRenderer.invoke('SaveConfig', payload),

    SwitchMenu: (payload) => ipcRenderer.invoke('SwitchMenu', payload),

    // Main to renderer
    onChangeRoute: (callback) => ipcRenderer.on('update-route', callback)
  }
)

import { ipcRenderer } from 'electron'

export function CreateInstance (payload, NedbDatabaseObject) {
  // web版との互換性確保のため
  return undefined
}

export function Insert (payload) {
  return ipcRenderer.invoke('Insert', payload)
}

export function Find (payload) {
  return ipcRenderer.invoke('Find', payload)
}

export function FindOne (payload) {
  return ipcRenderer.invoke('FindOne', payload)
}

export function FindOneByHash (payload) {
  return ipcRenderer.invoke('FineOneByHash', payload)
}

export function Count (payload) {
  return ipcRenderer.invoke('Count', payload)
}

export function Update (payload) {
  return ipcRenderer.invoke('Update', payload)
}

export function Remove (payload) {
  return ipcRenderer.invoke('Remove', payload)
}

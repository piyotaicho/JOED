// import { ipcRenderer } from 'electron'

export function CreateInstance (payload, NedbDatabaseObject) {
  // web版との互換性確保のため
  return undefined
}

export function Insert (payload) {
  return window.IPC.Insert(payload)
}

export function Find (payload) {
  return window.IPC.Find(payload)
}

export function FindOne (payload) {
  return window.IPC.FindOne(payload)
}

export function FindOneByHash (payload) {
  return window.IPC.FineOneByHash(payload)
}

export function Count (payload) {
  return window.IPC.Count(payload)
}

export function Update (payload) {
  return window.IPC.Update(payload)
}

export function Remove (payload) {
  return window.IPC.Remove(payload)
}

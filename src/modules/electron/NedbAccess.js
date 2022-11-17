// import { ipcRenderer } from 'electron'

export function CreateInstance (payload, NedbDatabaseObject) {
  // web版との互換性確保のため
  return undefined
}

export function Insert (payload) {
  return window.API.Insert(payload)
}

export function Find (payload) {
  return window.API.Find(payload)
}

export function FindOne (payload) {
  return window.API.FindOne(payload)
}

export function FindOneByHash (payload) {
  return window.API.FineOneByHash(payload)
}

export function Count (payload) {
  return window.API.Count(payload)
}

export function Update (payload) {
  return window.API.Update(payload)
}

export function Remove (payload) {
  return window.API.Remove(payload)
}

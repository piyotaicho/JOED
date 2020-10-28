import { ipcRenderer } from 'electron'

const MD5salt = process.env.VUE_APP_MD5SALT

export async function LoadConfig () {
  return await ipcLoadConfig('Config')
}

export async function SaveConfig (payload) {
  return await ipcSaveConfig('Config', { Settings: payload })
}

export async function LoadPassword () {
  return (await ipcLoadConfig('Password', { Password: '' })).Password
}

export async function SavePassword (payload) {
  const HHX = require('xxhashjs')
  const hashedpassword = payload === '' ? '' : HHX.h64(payload, MD5salt).toString(16)
  return await ipcSaveConfig('Password', { Password: hashedpassword })
}

async function ipcLoadConfig (key, defaultvalue) {
  return await ipcRenderer.invoke('LoadConfig', { Key: key, DefaultConfig: defaultvalue || {} })
}

async function ipcSaveConfig (key, settings) {
  return await ipcRenderer.invoke('SaveConfig', { Key: key, Config: settings })
}

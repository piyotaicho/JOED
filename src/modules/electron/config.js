// Interface to electron store
import HHX from 'xxhashjs'

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
  const password = payload.password
  const salt = payload.salt

  const hashedpassword = password === '' ? '' : HHX.h64(password, salt).toString(16)
  return await ipcSaveConfig('Password', { Password: hashedpassword })
}

async function ipcLoadConfig (key, defaultvalue) {
  return await window.API.LoadConfig({ Key: key, DefaultConfig: defaultvalue || {} })
}

async function ipcSaveConfig (key, settings) {
  return await window.API.SaveConfig({ Key: key, Config: settings })
}

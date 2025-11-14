// IPC経由でelectron storeの設定ファイルへアクセスする
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

  // パスワードのhash化はsaltの32bit丸めで行う
  const hashedpassword = password === '' ? '' : HHX.h64(password, salt).toString(16)
  return await ipcSaveConfig('Password', { Password: hashedpassword })
}

// IPC wrappers : Proxy Object対策で生のオブジェクトに変換して渡す
async function ipcLoadConfig (key, defaultvalue) {
  return await window.API.LoadConfig(JSON.parse(JSON.stringify({ Key: key, DefaultConfig: defaultvalue || {} })))
}

async function ipcSaveConfig (key, settings) {
  return await window.API.SaveConfig(JSON.parse(JSON.stringify({ Key: key, Config: settings })))
}

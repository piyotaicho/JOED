// IPC経由でelectron storeの設定ファイルへアクセスする
import HHX from 'xxhashjs'

type ConfigSettings = Record<string, unknown>
type PasswordPayload = { password: string; salt: string | number }
type ConfigDocument = { Settings?: ConfigSettings; Password?: string }

export async function LoadConfig (_storecontext?: unknown): Promise<ConfigDocument> {
  return await ipcLoadConfig('Config')
}

export async function SaveConfig (payload: ConfigSettings, _storecontext?: unknown): Promise<void> {
  return await ipcSaveConfig('Config', { Settings: payload })
}

export async function LoadPassword (_storecontext?: unknown): Promise<string> {
  return String((await ipcLoadConfig('Password', { Password: '' })).Password || '')
}

export async function SavePassword (payload: PasswordPayload, _storecontext?: unknown): Promise<void> {
  const password = payload.password
  const salt = payload.salt

  // パスワードのhash化はsaltの32bit丸めで行う
  const hashedpassword = password === '' ? '' : HHX.h64(password, salt).toString(16)
  return await ipcSaveConfig('Password', { Password: hashedpassword })
}

export async function GetSystemInfo () {
  return await window.API.GetSystemInfo()
}

// IPC wrappers : Proxy Object対策で生のオブジェクトに変換して渡す
async function ipcLoadConfig (key: string, defaultvalue: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
  return await window.API.LoadConfig(JSON.parse(JSON.stringify({ Key: key, DefaultConfig: defaultvalue || {} })) as {
    Key: string
    DefaultConfig: Record<string, unknown>
  })
}

async function ipcSaveConfig (key: string, settings: Record<string, unknown>): Promise<void> {
  return await window.API.SaveConfig(JSON.parse(JSON.stringify({ Key: key, Config: settings })) as {
    Key: string
    Config: Record<string, unknown>
  })
}

export function relaunchApp () {
  return window.API.RelaunchApp()
}

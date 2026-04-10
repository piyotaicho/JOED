/**
 * src/types/electron.d.ts
 * Electron メインプロセス内の型定義
 * (background.ts および electron/NedbAccess.ts で使用)
 */

// import type { BrowserWindow, Session } from 'electron'

// -------- NeDB IPC ペイロード型 --------

export interface NedbQueryPayload {
  Query: Record<string, unknown>
  Projection?: Record<string, 0 | 1>
  Sort?: Record<string, 1 | -1>
  Skip?: number
  Limit?: number
}

export interface NedbInsertPayload {
  Document: Record<string, unknown>
}

export interface NedbUpdatePayload {
  Query: Record<string, unknown>
  Update: Record<string, unknown>
  Options?: {
    multi?: boolean
    upsert?: boolean
    returnUpdatedDocs?: boolean
  }
}

export interface NedbRemovePayload {
  Query: Record<string, unknown>
  Options?: {
    multi?: boolean
  }
}

export interface NedbHashPayload {
  Hash: string
  SALT: number | string
}

// -------- Config IPC ペイロード型 --------

export interface ConfigLoadPayload {
  Key: string
  DefaultConfig: Record<string, unknown>
}

export interface ConfigSavePayload {
  Key: string
  Config: Record<string, unknown>
}

// -------- アプリ内部状態 --------

export interface AppConfig {
  electronStore: import('electron-store').default | undefined
  storeConfig: {
    cwd?: string
    name?: string
    fileExtension?: string
  }
  databaseInstance: import('@seald-io/nedb') | undefined
  enableLocking: boolean
}

// -------- Vite 埋め込み定数 --------
// vite.config.ts の define で注入される

declare const __APP_VERSION__: string
declare const __APP_DESCRIPTION__: string

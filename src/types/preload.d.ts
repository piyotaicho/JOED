/**
 * src/types/preload.d.ts
 * Electron Preload (contextBridge) で window に注入される API の型定義
 * レンダラープロセス (Vue アプリ) 側から window.API / window.Versions として参照される
 */

// -------- IPC API --------

interface ElectronAPI {
  // --- NeDB ラッパー ---
  Insert(payload: { Document: Record<string, unknown> }): Promise<Record<string, unknown> | undefined>
  Find(payload: {
    Query: Record<string, unknown>
    Projection?: Record<string, 0 | 1>
    Sort?: Record<string, 1 | -1>
    Skip?: number
    Limit?: number
  }): Promise<Record<string, unknown>[]>
  FindOne(payload: {
    Query: Record<string, unknown>
    Projection?: Record<string, 0 | 1>
    Sort?: Record<string, 1 | -1>
    Skip?: number
  }): Promise<Record<string, unknown> | null>
  FindOneByHash(payload: { Hash: string; SALT: number | string }): Promise<number | undefined>
  Count(payload: { Query: Record<string, unknown> }): Promise<number>
  Update(payload: {
    Query: Record<string, unknown>
    Update: Record<string, unknown>
    Options?: Record<string, unknown>
  }): Promise<number>
  Remove(payload: {
    Query: Record<string, unknown>
    Options?: Record<string, unknown>
  }): Promise<number>
  DropDatabase(removeBackupFiles: boolean): Promise<void>

  // --- Config ---
  LoadConfig(payload: { Key: string; DefaultConfig: Record<string, unknown> }): Promise<Record<string, unknown>>
  SaveConfig(payload: { Key: string; Config: Record<string, unknown> }): Promise<void>

  // --- System ---
  GetSystemInfo(payload?: unknown): Promise<string>

  // --- Menu ---
  SwitchMenu(payload: unknown): void

  // --- Navigation ---
  OpenURL(payload: string): void
  RelaunchApp(): void

  // --- Router (main -> renderer) ---
  onChangeRouter(callback: (event: unknown, route: string) => void): void
}

// -------- Versions --------

interface ElectronVersions {
  ApplicationName(): string | undefined
  ApplicationVersion(): string
  Platform(): string
  Electron(): string
  Node(): string
  V8(): string
  Chrome(): string
}

// -------- Window の拡張 --------

declare global {
  interface Window {
    API: ElectronAPI
    Versions: ElectronVersions
  }
}

export {}

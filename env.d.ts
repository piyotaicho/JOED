/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_APP_MODULE_PREFIX: string
  readonly VITE_APP_MODE: string
  readonly VITE_APP_ID: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_ELECTION?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare const __APP_ELECTRON__: string
declare const __APP_COPYRIGHT__: string
declare const __APP_VERSION__: string

declare module 'encoding-japanese'
declare module 'xxhashjs'
declare module 'vuex' {
  interface LooseStoreOptions {
    modules?: Record<string, any>
    state?: any
    getters?: Record<string, (state: any, getters: any, rootState: any, rootGetters: any) => any>
    mutations?: Record<string, (state: any, payload?: any) => any>
    actions?: Record<string, (context: any, payload?: any) => any>
  }
  export function createStore(options: LooseStoreOptions): any
}
declare module 'depmodules/config' {
  export function LoadConfig(storecontext?: unknown): Promise<Record<string, unknown>>
  export function SaveConfig(payload: Record<string, unknown>, storecontext?: unknown): Promise<void>
  export function LoadPassword(storecontext?: unknown): Promise<string>
  export function SavePassword(payload: { password: string; salt: string | number }, storecontext?: unknown): Promise<void>
  export function GetSystemInfo(): Promise<string>
  export function relaunchApp(): void
}

declare module 'depmodules/NedbAccess' {
  export function Insert(payload: { Document?: Record<string, unknown> }): Promise<Record<string, unknown> | undefined>
  export function Find(payload: {
    Query?: Record<string, unknown>
    Projection?: Record<string, 0 | 1>
    Sort?: Record<string, 1 | -1>
    Skip?: number | string
    Limit?: number | string
  }): Promise<Record<string, unknown>[]>
  export function FindOne(payload: {
    Query?: Record<string, unknown>
    Projection?: Record<string, 0 | 1>
    Sort?: Record<string, 1 | -1>
    Skip?: number | string
  }): Promise<Record<string, unknown> | null>
  export function FindOneByHash(payload: { Hash?: string; SALT?: number | string }): Promise<number | null | undefined>
  export function Count(payload: { Query?: Record<string, unknown> }): Promise<number>
  export function Update(payload: {
    Query?: Record<string, unknown>
    Update?: Record<string, unknown>
    Options?: Record<string, unknown>
  }): Promise<number>
  export function Remove(payload: {
    Query?: Record<string, unknown>
    Options?: Record<string, unknown>
  }): Promise<number>
  export function Dump(): Promise<Record<string, unknown>[]>
  export function Drop(removeBackupFiles?: boolean): Promise<void>
}

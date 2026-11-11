import HHX from 'xxhashjs'

type ConfigSettings = Record<string, unknown>
type PasswordPayload = { password: string; salt: string | number }
type StoreContextLike = {
  dispatch: (type: string, payload?: unknown, options?: { root?: boolean }) => Promise<unknown>
}

const assertStoreContext = (storecontext?: unknown): StoreContextLike => {
  if (!storecontext || typeof (storecontext as StoreContextLike).dispatch !== 'function') {
    throw new Error('store context is required in serve mode')
  }
  return storecontext as StoreContextLike
}

export function LoadConfig (storecontext?: unknown): Promise<unknown> {
  const context = assertStoreContext(storecontext)
  return context.dispatch('dbFindOne', {
    Query: { Settings: { $exists: true } }
  },
  { root: true })
}

export function SaveConfig (settings: ConfigSettings, storecontext?: unknown): Promise<unknown> {
  const context = assertStoreContext(storecontext)
  return context.dispatch('dbUpdate', {
    Query: { Settings: { $exists: true } },
    Update: { Settings: settings },
    Options: { upsert: true }
  },
  { root: true })
}

export async function LoadPassword (storecontext?: unknown): Promise<string> {
  const context = assertStoreContext(storecontext)
  return await context.dispatch('dbFindOne',
    {
      Query: { Password: { $exists: true } }
    },
    { root: true }
  ).then((passworddocument) => {
    if (!passworddocument || typeof passworddocument !== 'object') {
      return ''
    }
    return String((passworddocument as { Password?: string }).Password || '')
  })
}

export async function SavePassword (payload: PasswordPayload, storecontext?: unknown): Promise<void> {
  const context = assertStoreContext(storecontext)
  const password = payload.password
  const salt = payload.salt

  if (password === '') {
    await context.dispatch('dbRemove',
      {
        Query: { Password: { $exists: true } },
        Options: { multi: true }
      },
      { root: true })
  } else {
    // パスワードのhash化はsaltの32bit丸めで行う
    const hashedpassword = password === '' ? '' : HHX.h64(password, salt).toString(16)
    await context.dispatch('dbUpdate',
      {
        Query: { Password: { $exists: true } },
        Update: { Password: hashedpassword },
        Options: { multi: false, upsert: true }
      },
      { root: true })
  }
}

export async function GetSystemInfo () {
  return navigator?.userAgent ?? 'Unknown Environment'
}

export function relaunchApp () {
  window.location.reload()
}

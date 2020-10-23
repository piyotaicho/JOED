const MD5salt = process.env.VUE_APP_MD5SALT

export function LoadConfig (storecontext) {
  return storecontext.dispatch('dbFindOne', {
    Query: { Settings: { $exists: true } }
  },
  { root: true })
}

export function SaveConfig (settings, storecontext) {
  return storecontext.dispatch('dbUpdate', {
    Query: { Settings: { $exists: true } },
    Update: { Settings: settings },
    Options: { upsert: true }
  },
  { root: true })
}

export async function LoadPassword (storecontext) {
  return await storecontext.dispatch('dbFindOne',
    {
      Query: { Password: { $exists: true } }
    },
    { root: true }
  ).then(passworddocument => passworddocument === null ? '' : passworddocument.Password)
}

export async function SavePassword (payload, storecontext) {
  if (payload === '') {
    return storecontext.dispatch('dbRemove',
      {
        Query: { Password: { $exists: true } },
        Options: { multi: false }
      },
      { root: true })
      .then(_ => storecontext.commit('PasswordRequirement', false))
  } else {
    const HHX = require('xxhashjs')
    const hashedPassword = HHX.h64(payload, MD5salt).toString(16)
    return storecontext.dispatch('dbUpdate',
      {
        Query: { Password: { $exists: true } },
        Update: { Password: hashedPassword },
        Options: { upsert: true }
      },
      { root: true })
  }
}

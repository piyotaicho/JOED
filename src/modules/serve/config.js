import HHX from 'xxhashjs'

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
  const password = payload.password
  const salt = payload.salt

  if (password === '') {
    storecontext.dispatch('dbRemove',
      {
        Query: { Password: { $exists: true } },
        Options: { multi: true }
      },
      { root: true })
  } else {
    const hashedpassword = password === '' ? '' : HHX.h64(password, salt).toString(16)
    storecontext.dispatch('dbUpdate',
      {
        Query: { Password: { $exists: true } },
        Update: { Password: hashedpassword },
        Options: { multi: false, upsert: true }
      },
      { root: true })
  }
}

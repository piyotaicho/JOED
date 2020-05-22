/* global DatabaseInstance */
const MD5salt = 0x76b3

export default {
  namespaced: true,
  state: {
    Authenticated: false
  },
  mutations: {
    SetAuthenticatedStatus (state, payload) {
      state.Authenticated = !!payload
    }
  },
  getters: {
    isAuthenticated (state) {
      return state.Authenticated
    }
  },
  actions: {
    Authenticate (context, payload) {
      const HHX = require('xxhashjs')

      return new Promise((resolve, reject) => {
        DatabaseInstance.findOne(
          { Password: { $exists: true } },
          (error, document) => {
            if (error) reject(error)
            if (document === null) resolve()

            const givenHash = HHX.h64(payload, MD5salt).toString(16)
            if (document.Password === givenHash) {
              resolve()
            } else {
              reject(new Error('Authentication failed'))
            }
          }
        )
      }).then(() => {
        context.commit('SetAuthenticatedStatus', true)
      }).catch(() => {
        context.commit('SetAuthenticatedStatus', false)
      })
    },
    SetPassword (context, payload) {
      const HHX = require('xxhashjs')

      return new Promise((resolve, reject) => {
        if (payload === '') {
          DatabaseInstance.remove(
            { Password: { $exists: true } },
            { multi: false },
            (error) => {
              if (error) reject(error)
            }
          )
        } else {
          const hashedPassword = HHX.h64(payload, MD5salt).toString(16)
          DatabaseInstance.update(
            { Password: { $exists: true } },
            { Password: hashedPassword },
            { upsert: true },
            (error, numRows) => {
              if (error) reject(error)
              if (numRows > 0) console.log('Password updated.')
            }
          )
        }
        resolve()
      })
    }
  }
}

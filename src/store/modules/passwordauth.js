/* global DatabaseInstance */

// 保存先は最終的にはデータベースではなく electron.config に逃げる予定

const MD5salt = 0x76b3

export default {
  namespaced: true,
  state: {
    Authenticated: false
  },
  mutations: {
    SetStatus (state, payload) {
      state.Authenticated = payload
    }
  },
  getters: {
    isAuthenticated (state) {
      return state.Authenticated
    }
  },
  actions: {
    // データベースに保存されたパスワードハッシュを用いて認証する.
    // データベースにパスワードハッシュが保存されていない場合は無条件で認証を完了する.
    // 認証結果は {Boolean} Authenticated に.
    //
    // @param {String} パスワード文字列
    Authenticate (context, payload) {
      const HHX = require('xxhashjs')

      return new Promise((resolve, reject) => {
        context.rootState.DatabaseInstance.findOne(
          { Password: { $exists: true } },
          (error, document) => {
            if (error) reject(error)
            if (document === null || document.Password === HHX.h64(payload, MD5salt).toString(16)) {
              context.commit('SetStatus', true)
              resolve()
            } else {
              context.commit('SetStatus', false)
              reject(new Error('Authentication failed'))
            }
          }
        )
      })
    },
    // パスワードハッシュにパスワードを保存する.
    // 空白パスワード文字列はパスワードのレコード自体を削除する.
    //
    // @param {String} パスワード文字列
    SetPassword (context, payload) {
      const HHX = require('xxhashjs')

      return new Promise((resolve, reject) => {
        if (payload === '') {
          context.rootState.DatabaseInstance.remove(
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
              if (numRows > 0) console.log('Password updated.', payload, '->', hashedPassword)
            }
          )
        }
        resolve()
      })
    }
  }
}
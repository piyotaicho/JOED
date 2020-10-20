// 保存先は最終的にはデータベースではなく electron.config に逃げる予定

const MD5salt = process.env.VUE_APP_MD5SALT

export default {
  namespaced: true,
  state: {
    Authenticated: false,
    PasswordRequired: true
  },
  mutations: {
    AuthenticationStatus (state, payload) {
      state.Authenticated = payload
    },
    PasswordRequirement (state, payload) {
      state.PasswordRequired = payload
    }
  },
  getters: {
    isAuthenticated (state) {
      return state.Authenticated
    },
    isPasswordRequired (state) {
      return state.PasswordRequired
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

      return context.dispatch('dbFindOne',
        {
          Query: { Password: { $exists: true } }
        },
        { root: true }
      )
        .then(hashedpassword => {
          // パスワード設定無し
          if (hashedpassword === '') {
            if (!payload.SuppressStateChange) {
              context.commit('PasswordRequirement', false)
              context.commit('AuthenticationStatus', true)
            } else {
              if (hashedpassword === HHX.h64(payload.PasswordString, MD5salt).toString(16)) {
                if (!payload.SuppressStateChange) {
                  context.commit('AuthenticationStatus', true)
                }
              } else {
                console.log('Authentication failed.')
                if (!payload.SuppressStateChange) {
                  context.commit('AuthenticationStatus', false)
                }
                return Promise.reject(new Error('Authentication failed'))
              }
            }
          }
        })
    },
    // パスワードハッシュにパスワードを保存する.
    // 空白パスワード文字列はパスワードのレコード自体を削除する.
    //
    // @param {String} パスワード文字列
    SetPassword (context, payload) {
      const HHX = require('xxhashjs')

      if (payload === '') {
        return context.dispatch('dbRemove',
          {
            Query: { Password: { $exists: true } },
            Options: { multi: false }
          },
          { root: true })
          .then(_ => context.commit('PasswordRequirement', false))
      } else {
        const hashedPassword = HHX.h64(payload, MD5salt).toString(16)
        return context.dispatch('dbUpdate',
          {
            Query: { Password: { $exists: true } },
            Update: { Password: hashedPassword },
            Options: { upsert: true }
          },
          { root: true })
      }
    }
  }
}

import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const NoOptions = {}

// ファイルベースのデータベースを作成
// 実装の際にはインスタンスの置き場所をちゃんと考える

var Database = require('nedb')
var DatabaseInstance = new Database({
  // 当面はブラウザのローカルストレージを使用する.
  // electronに実装する際にはユーザデータフォルダに置くようにする
  filename: 'joed.nedb',
  autoload: true
})

const store = new Vuex.Store({
  state: {
    ApplicationVersion: '5.00.0517.beta',
    // データベースの症例部分(SequentialIdをもつ)のキャッシュ
    // 冗長だがデータベースの変更作業が行われる度にロードする。InfinityScrollと連動予定。
    DataStore: [],
    CurrentIndex: -1, // pageficationではないが表示されているデータのインデックス
    Filters: {}, // フィルターの設定
    SortOrders: {
      SequentialId: 1
    }, // ソートの設定
    Settings: {} // システム設定
  },
  getters: {
    ApplicationVersion (state) {
      return state.ApplicationVersion
    },
    CountEntireDatastore (state) {
      return state.DataStore.length
    },
    GetUids (state) {
      return state.DataStore.map(
        item => item.SequentialId
      )
    },
    // SequentialId をもつドキュメントを取得する
    GetItemObject (state) {
      return function (SequentialId) {
        const FilterdItems = state.DataStore.filter((item) => {
          return item.SequentialId === SequentialId
        })
        return FilterdItems[0]
      }
    },
    GetSystemSetting (state) {
      return state.Settings
    }
  },

  mutations: {
    SetDatastore (state, payload) {
      if (payload) {
        state.DataStore = payload
      }
    },
    SetSystemSettings (state, payload) {
      if (payload) {
        state.Settings = payload
      }
    }
  },

  actions: {
    // データベースのキャッシュ更新～変更操作のあとは必ず呼び出す
    ReloadDatastore (context) {
      DatabaseInstance.find(
        { SequentialId: { $gt: 0 } }
      )
        .sort(context.state.SortOrders)
        .exec(
          (error, documents) => {
            if (!error) {
              context.commit('SetDatastore', documents)
            }
          }
        )
    },

    InsertItemIntoDatastore (context, payload) {
      const ErrorAutonumberFailed = 'データベースエラー AUTO-NUMBERING FAILED'

      return new Promise((resolve, reject) => {
        DatabaseInstance.count(
          {
            InstitutionalPatientId: payload.InstitutionalPatientId,
            DateOfProcedure: payload.DateOfProcedure
          },
          (error, count) => {
            if (error) reject(error)
            if (count > 0) reject(new Error('同一日に同一IDの症例は登録できません.'))
            resolve()
          }
        )
      }).then(() => {
        return new Promise((resolve, reject) => {
          payload.SequentialId = '__autoid__'
          DatabaseInstance.insert(
            payload,
            (error) => {
              if (error) reject(error)
              DatabaseInstance.findOne(
                { sequence: 'maindb' },
                (error, sequencerow) => {
                  if (error) reject(error)
                  const newid = (sequencerow ? sequencerow.number : 0) + 1
                  DatabaseInstance.update(
                    { sequence: 'maindb' },
                    { sequence: 'maindb', number: newid },
                    { upsert: true },
                    (error) => {
                      if (error) reject(new Error(ErrorAutonumberFailed))
                      DatabaseInstance.update(
                        { SequentialId: '__autoid__' },
                        { $set: { SequentialId: newid } },
                        NoOptions,
                        (error) => {
                          if (error) reject(new Error(ErrorAutonumberFailed))
                          context.dispatch('ReloadDatastore')
                          resolve()
                        }
                      )
                    }
                  )
                }
              )
            }
          )
        })
      }).catch(error => {
        if (error.message === ErrorAutonumberFailed) {
          DatabaseInstance.remove(
            { SequentialId: '__autoid__' },
            { multi: false }
          )
        }
        return Promise.reject(error)
      })
    },
    ReplaceItemInDatastore (context, payload) {
      return new Promise((resolve, reject) => {
        if (payload.SequentialId <= 0) reject(new Error('内部IDの指定に問題があります.'))
        DatabaseInstance.find(
          {
            InstitutionalPatientId: payload.InstitutionalPatientId,
            DateOfProcedure: payload.DateOfProcedure
          },
          { SequentialId: 1 },
          (error, documents) => {
            if (error) reject(error)
            for (const document of documents) {
              if (document.SequentialId !== payload.SequentialId) reject(new Error('同一日に同一IDの症例は登録できません.'))
            }
            DatabaseInstance.update(
              { SequentialId: payload.SequentialId },
              payload,
              NoOptions,
              (error, numupdated) => {
                if (error) reject(error)
                context.dispatch('ReloadDatastore')
                resolve()
              }
            )
          }
        )
      })
    },
    UpsertItemInDatastore (context, payload) {
      if (payload.SequentialId && payload.SequentialId > 0) {
        return context.dispatch('ReplaceItemInDatastore', payload)
      } else {
        return context.dispatch('InsertItemIntoDatastore', payload)
      }
    },

    RemoveItemFromDatastore (context, payload) {
      return new Promise((resolve, reject) => {
        try {
          if (payload.SequentialId <= 0) throw new Error()
          DatabaseInstance.remove(
            { SequentialId: payload.SequentialId },
            NoOptions,
            (error) => {
              if (error) throw error
              context.dispatch('ReloadDatastore')
              resolve()
            }
          )
        } catch (error) {
          reject(error)
        }
      })
    },

    ReloadSettings (context) {
      DatabaseInstance.findOne(
        { Settings: { $exist: true } }
      )
        .exec(
          (errstring, documents) => {
            if (documents.length > 0) {
              context.commit('SetSystemSettings', documents[0].Settings)
            }
          }
        )
    },
    UpdateSettings (context, payload) {
      if (Object.keys(payload).length > 0) {
        DatabaseInstance.update(
          { Settings: { $exist: true } },
          { Settings: payload },
          { upsert: true },
          (errorstring) => {
            if (errorstring) {
              console.log('error on update setting', errorstring)
            } else {
              context.commit('ReloadSettings')
            }
          }
        )
      }
    }

  }
})

export default store

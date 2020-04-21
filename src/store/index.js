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
    // データベースの症例部分(SqeuentialIdをもつ)のキャッシュ
    // データベースの変更作業が行われる度にロードする。InfinityScrollと連動予定。
    DataStore: []
  },
  getters: {
    GetDatastore (state) {
      return state.DataStore
    },
    CountDatastore (state) {
      return state.DataStore.length
    },
    // SequentialIdの配列を取得する
    GetUids (state) {
      return state.DataStore.map(
        item => item.SqeuentialId
      ).filter(
        filteritem => filteritem
      )
    },
    // SqeuentialId をもつドキュメントを取得する
    GetItemObject (state) {
      return function (SqeuentialId) {
        const FilterdItems = state.DataStore.filter((item) => {
          return item.SqeuentialId === SqeuentialId
        })
        return FilterdItems[0]
      }
    }
  },
  mutations: {
    SetDatastore (state, payload) {
      if (payload) {
        state.DataStore = payload
      }
    }
  },
  actions: {
    // データベースのキャッシュ更新～変更操作のあとは必ず呼び出す
    ReloadDatastore (context) {
      DatabaseInstance.find(
        { SqeuentialId: { $gt: 0 } },
        { _id: 0 }
      )
        .sort({
          SqeuentialId: 1
        })
        .exec(
          (errstring, documents) => {
            context.commit('SetDatastore', documents)
          }
        )
    },
    InsertItemIntoDatastore (context, payload) {
      payload.SqeuentialId = '__autoid__'
      DatabaseInstance.insert(
        payload,
        (errorstring) => {
          if (!errorstring) {
            DatabaseInstance.findOne(
              { sequence: 'maindb' },
              (err, sequencerow) => {
                var newid = 0
                if (!err) {
                  newid = (sequencerow ? sequencerow.number : 0) + 1

                  DatabaseInstance.update(
                    { sequence: 'maindb' },
                    { sequence: 'maindb', number: newid },
                    { upsert: true },
                    () => {
                      DatabaseInstance.update(
                        { SqeuentialId: '__autoid__' },
                        { $set: { SqeuentialId: newid } },
                        NoOptions,
                        () => {
                          context.dispatch('ReloadDatastore')
                        }
                      )
                    }
                  )
                }
              }
            )
          }
        }
      )
    },
    UpdateItemInDatastore (context, payload) {
      if (payload.SqeuentialId > 0) {
        DatabaseInstance.update(
          { SqeuentialId: payload.SqeuentialId },
          { $set: payload },
          NoOptions,
          () => {
            context.dispatch('ReloadDatastore')
          }
        )
      }
    },
    ReplaceItemInDatastore (context, payload) {
      if (payload.SqeuentialId > 0) {
        DatabaseInstance.update(
          { SqeuentialId: payload.SqeuentialId },
          payload,
          NoOptions,
          () => {
            context.dispatch('ReloadDatastore')
          }
        )
      }
    },
    UpsertItemInDatastore (context, payload) {
      if (payload.SqeuentialId && payload.SqeuentialId > 0) {
        context.dispatch('ReplaceItemInDatastore', payload)
      } else {
        context.dispatch('InsertItemIntoDatastore', payload)
      }
    },
    RemoveItemFromDatastore (context, payload) {
      if (payload.SqeuentialId > 0) {
        DatabaseInstance.remove(
          { SqeuentialId: payload.SqeuentialId },
          NoOptions,
          () => {
            context.dispatch('ReloadDatastore')
          }
        )
      }
    }
  }
})

export default store

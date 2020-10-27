import Vue from 'vue'
import Vuex from 'vuex'
import * as NedbAccess from 'depmodules/NedbAccess'
import system from '@/store/modules/system'
import password from '@/store/modules/passwordauth'

Vue.use(Vuex)

const Database = require('nedb')

const store = new Vuex.Store({
  modules: {
    system, password
  },
  state: {
    DatabaseInstance: undefined, // 直接参照禁止, electron版ではundefined
    DocumentIds: {
      List: [], // queryされたuidの全リスト
      TotalCount: 0, // 全登録数
      Range: 0, // 表示対象のuidの数
      Identifier: 0 // 表示クエリ変更のシリアル値
    },
    LoadAtOnce: 20, // 一度にロードするデータの数

    DataStore: [], // インメモリのデータベースレプリケーション

    // 以下データベースリストのクエリの待避
    Filters: [],
    Sort: {
      DocumentId: -1
    },
    Search: {
      IgnoreQuery: false,
      Filter: {},
      Preserve: ''
    }
  },
  getters: {
    // 現在queryで設定されているドキュメントの DocumentId を配列で返す.
    //
    Uids (state) {
      return state.DocumentIds.List
    },
    // 現在表示されているドキュメントの DocumentId を配列で返す.
    //
    PagedUids (state) {
      return state.DocumentIds.List.slice(0, state.DocumentIds.Range)
    },
    // 現在表示されているドキュメントの数
    //
    PagedUidsRange (state) {
      return state.DocumentIds.Range
    },
    // 現在表示対象のドキュメントリストのシリアル値
    //
    DisplayIdentifier (state) {
      return state.DocumentIds.Identifier
    },
    // 現在queryで設定されているドキュメントの数を返す.
    //
    NumberOfCases (state) {
      return state.DocumentIds.List.length
    },
    // 現在queryで設定されているドキュメントの数を返す.
    //
    TotalNumberOfCases (state) {
      return state.DocumentIds.TotalCount
    },
    // 指定された DocumentId の前後の DocumentId を返す.
    // 存在しないものは 0.
    //
    NextUids (state, getters) {
      return function (currentUid) {
        const index = state.DocumentIds.List.indexOf(currentUid)
        if (currentUid === 0 || index === -1) {
          return { Prev: 0, Next: 0 }
        } else {
          const listlength = state.DocumentIds.List.length
          return {
            Prev: index === 0 ? 0 : getters.Uids[index - 1],
            Next: index === listlength - 1 ? 0 : getters.Uids[index + 1]
          }
        }
      }
    },
    // DocumentId をもつドキュメントを取得する. ロードされていない場合は空のオブジェクトが返る.
    //
    // @param {Number or Object}
    CaseDocument (state) {
      return function (payload) {
        if (payload) {
          const uid = payload || payload.DocumentId
          const DocumentIndex = state.DataStore.findIndex(item => item.DocumentId === uid)
          if (DocumentIndex !== -1) {
            return state.DataStore[DocumentIndex]
          }
        }
        return {}
      }
    },
    // Listの表示設定を取得
    //
    ViewSettings (state) {
      return {
        Filters: state.Filters,
        Sort: state.Sort,
        Search: state.Search
      }
    },
    // 検索が有効かを取得
    //
    SearchActivated (state) {
      return Object.keys(state.Search.Filter).length > 0
    },
    // 現在のView設定からのクエリを作成する
    //
    ViewQuery (state) {
      const filters = Object.assign([], state.Filters)
      const query = {}
      const sort = Object.assign({}, state.Sort)

      if (Object.keys(state.Search.Filter).length > 0) {
        if (state.Search.IgnoreQuery) {
          filters.splice(0, filters.length, state.Search.Filter)
        } else {
          filters.push(state.Search.Filter)
        }
      }

      for (const filter of filters) {
        const key = filter.Field
        const value = filter.Value

        if (query[key] === undefined) {
          query[key] = value
        } else {
          if (query[key].$in) {
            query[key].$in.push(value)
          } else {
            query[key] = { $in: [query[key], value] }
          }
        }
      }

      // DocumentId > 0 は DocumentIdの指定が無い限り必ず入るのでハードコード
      if (!query.DocumentId) {
        query.DocumentId = { $gt: 0 }
      }

      if (query.DateOfProcedure) {
        let regexp = ''
        if (query.DateOfProcedure.$in) {
          regexp = query.DateOfProcedure.$in.join('|')
        } else {
          regexp = query.DateOfProcedure
        }
        regexp = '^(' + regexp + ')-'
        query.DateOfProcedure = { $regex: new RegExp(regexp) }
      }

      return {
        Query: query,
        Sort: sort
      }
    }
  },

  mutations: {
    // DatabaseInstanceを設定する.
    // App.vue の onCreated からのみ呼ばれる.
    //
    initDatabase (state) {
      if (state.DatabaseInstance === undefined) {
        Vue.set(state, 'DatabaseInstance', NedbAccess.CreateInstance(
          {
            filename: 'joed.nedb',
            autoload: true
          },
          Database
        ))
      }
    },
    // DocumentIdsにドキュメントリストを設定する
    //
    // @param {Object} DocumentIds
    SetDocumentIds (state, payload) {
      Vue.set(state.DocumentIds, 'List', payload.DocumentIds)
      Vue.set(state.DocumentIds, 'Identifier', state.DocumentIds.Identifier + 1)
    },
    // DataStoreにデータベースをキャッシュする.
    //
    // @param {Object} document
    SetDatastore (state, payload) {
      const foundIndex = state.DataStore.findIndex(item => item.DocumentId === payload.DocumentId)
      if (foundIndex === -1) {
        Vue.set(state.DataStore, state.DataStore.length, payload)
      } else {
        Vue.set(state.DataStore, foundIndex, payload)
      }
    },
    // キャッシュDataStoreから指定のドキュメントを破棄.
    //
    // @param {Object} DocumentId
    RemoveDatastore (state, payload) {
      const foundIndex = state.DataStore.findIndex(item => item.DocumentId === payload.DocumentId)
      if (foundIndex !== -1) {
        Vue.delete(state.DataStore, foundIndex)
      }
    },
    // 総症例数
    //
    // @Param {Number}
    SetTotalDocumentCount (state, payload) {
      Vue.set(state.DocumentIds, 'TotalCount', payload)
    },
    // 表示対象数をクリア
    //
    ClearDocumentListRange (state) {
      Vue.set(state.DocumentIds, 'Range', Math.min(state.LoadAtOnce, state.DocumentIds.List.length))
    },
    // 表示対象数を増やす
    //
    IncrementDocumentListRange (state) {
      Vue.set(state.DocumentIds, 'Range', Math.min(state.DocumentIds.Range + state.LoadAtOnce, state.DocumentIds.List.length))
    },

    // Filtersを設定
    //
    // @param {Object}
    SetFilters (state, payload = []) {
      const newFilters = payload.length > 0 ? payload : state.system.settings.View.Filters
      Vue.set(state, 'Filters', newFilters)
    },

    // Searchを設定
    //
    // @param {Object}
    SetSearch (state, payload = {}) {
      if (payload.Filter !== undefined) {
        Vue.set(state.Search, 'Filter', payload.Filter)
      }
      if (payload.IgnoreQuery !== undefined) {
        Vue.set(state.Search, 'IgnoreQuery', !!payload.IgnoreQuery)
      }
      if (payload.Preserve !== undefined) {
        Vue.set(state.Search, 'Preserve', payload.Preserve)
      }
    },

    // Sortの設定
    //
    // @param {Object}
    SetSort (state, payload = {}) {
      const keyvalue = Object.entries(payload)[0]
      Vue.set(state, 'Sort',
        (keyvalue && keyvalue.length === 2)
          ? {
            [keyvalue[0]]: keyvalue[1]
          }
          : state.system.settings.View.Sort
      )
    }
  },

  actions: {
    // データベース操作 - moduleのフォルダで実行環境を分離する作戦
    // Insert document
    // @Param {Object} Document
    dbInsert (context, payload) {
      return NedbAccess.Insert(payload, context.state.DatabaseInstance)
    },
    // Find documents
    // @Param {Object} Query, Projection, Sort,
    // @Param {Number} Skip, Limit
    dbFind (context, payload) {
      return NedbAccess.Find(payload, context.state.DatabaseInstance)
    },
    // Find a first document
    // @Param {Object} Query, Projection, Sort,
    // @Param {Number} Skip
    dbFindOne (context, payload) {
      return NedbAccess.FindOne(payload, context.state.DatabaseInstance)
    },
    // Count matched documents
    // @Param {Object} Query
    dbCount (context, payload) {
      return NedbAccess.Count(payload, context.state.DatabaseInstance)
    },
    // Update documents
    // @Param {Object} Query, Update, Options
    dbUpdate (context, payload) {
      return NedbAccess.Update(payload, context.state.DatabaseInstance)
    },
    // Remove documents
    // @Param {Object} Query, Options
    dbRemove (context, payload) {
      return NedbAccess.Remove(payload, context.state.DatabaseInstance)
    },

    // DocumentIdリストの更新. データベースの操作後は必ず実行する.
    //
    //
    ReloadDocumentList (context) {
      const Projection = { DocumentId: 1, _id: 0 }

      return context.dispatch('dbFind',
        {
          Query: context.getters.ViewQuery.Query,
          Sort: context.getters.ViewQuery.Sort,
          Projection: Projection
        })
        .then(documents => {
          context.commit('SetDocumentIds',
            {
              DocumentIds: documents.map(doc => doc.DocumentId)
            }
          )
          context.commit('ClearDocumentListRange')
        })
        .then(async function () {
          context.commit('SetTotalDocumentCount', await context.dispatch('dbCount', { Query: { DocumentId: { $gt: 0 } } }))
        })
        .catch(error => error)
    },

    // 症例データの取得. ドキュメントの取得自体はgettersを経由する
    // $store.dispatch('FetchDocument', { DocumentId: foo }).then(_ => $store.getters.CaseDocument( foo ) )
    //
    // @Param {Object} DocumentIdのみのオブジェクト
    FetchDocument (context, payload) {
      return new Promise((resolve, reject) => {
        if (!payload.DocumentId) {
          resolve(undefined)
        } else {
          // 既にロードされているデータであればキャッシュから取得する
          const DataStoreIndex = context.state.DataStore.findIndex(item => item.DocumentId === payload.DocumentId)
          if (DataStoreIndex !== -1) {
            resolve(DataStoreIndex)
          } else {
            // キャッシュされていないデータなので読み込んでDatastoreにキャッシュする
            context.dispatch('dbFindOne', { Query: { DocumentId: payload.DocumentId }, Projection: { _id: 0 } })
              .then(fetcheddocument => {
                context.commit('SetDatastore', fetcheddocument)
                resolve(0)
              })
              .catch(error => reject(error))
          }
        }
      })
    },
    // 症例データの新規登録. 同一日時に同一IDの症例は登録出来ない.
    //
    // @param {Object} オブジェクトCase
    InsertDocument (context, payload) {
      // const DatabaseInstance = context.state.DatabaseInstance
      const ErrorAutonumberFailed = 'データベースエラーです. AUTO-NUMBERING FAILED'

      return new Promise((resolve, reject) => {
        context.dispatch('dbCount', {
          Query: {
            PatientId: payload.PatientId,
            DateOfProcedure: payload.DateOfProcedure
          }
        })
          .then(
            count => {
              if (count > 0) reject(new Error('同一日に同一IDの症例は登録できません.'))
              resolve()
            },
            error => reject(error)
          )
      })
        .then(_ => {
          payload.DocumentId = '__autoid__'
          return context.dispatch('dbInsert', {
            Document: payload
          })
        })
        .then(_ => {
          return new Promise((resolve, reject) => {
            let newid = 0
            // 連番付与
            context.dispatch('dbFindOne', {
              Query: { sequence: 'maindb' }
            })
              .then(sequencerow => {
                newid = (sequencerow ? sequencerow.number : 0) + 1

                context.dispatch('dbUpdate', {
                  Query: { sequence: 'maindb' },
                  Update: { sequence: 'maindb', number: newid },
                  Options: { upsert: true }
                })
                  .then(_ => resolve(newid))
                  .catch(_ => reject(new Error(ErrorAutonumberFailed)))
              })
              .catch(_ => reject(new Error(ErrorAutonumberFailed)))
          })
            .then(newid => {
              // 登録
              context.dispatch('dbUpdate', {
                Query: { DocumentId: '__autoid__' },
                Update: { $set: { DocumentId: newid } },
                Options: {}
              })
                // 登録完了
                .then(_ => context.dispatch('ReloadDocumentList'))
                .catch(error => Promise.reject(error))
            })
            .catch(error => {
              // 連番付与登録に失敗した場合仮登録の部分は削除-rollback
              context.dispatch('dbRemove', {
                Query: {
                  DocumentId: '__autoid__'
                },
                Options: {
                  multi: true
                }
              }).then(_ => {
                Promise.reject(error)
              })
            })
        })
        .catch(_ => {
          // Insertに失敗
          return Promise.reject(new Error('データベースエラーです.'))
        })
    },

    // 症例データの更新. Case.DocumentId をキーとするため、有効な DocumentId であることが必須.
    // 同一日時に同一IDの症例は登録出来ない.
    //
    // @param {Object} オブジェクトCase
    ReplaceDocument (context, payload) {
      if (payload.DocumentId <= 0) {
        return Promise.reject(new Error('内部IDの指定に問題があります.'))
      }
      return context.dispatch('dbFind', {
        Query: {
          PatientId: payload.PatientId,
          DateOfProcedure: payload.DateOfProcedure
        },
        Projection: { DocumentId: 1 }
      })
        .then(documents => {
          for (const document of documents) {
            if (document.DocumentId !== payload.DocumentId) {
              return Promise.reject(new Error('同一日に同一IDの症例は登録できません.'))
            }
          }
          return context.dispatch('dbUpdate', {
            Query: { DocumentId: payload.DocumentId },
            Update: payload,
            Options: {}
          })
        })
        .then(_ => {
          context.commit('RemoveDatastore', { DocumentId: payload.DocumentId })
          return context.dispatch('ReloadDocumentList')
        })
    },

    // 症例データの登録. DocumentIdで、新規(===0)・更新(>0)を区別する.
    //
    // @param {Object} オブジェクトCase
    UpsertDocument (context, payload) {
      if (payload.DocumentId && payload.DocumentId > 0) {
        return context.dispatch('ReplaceDocument', payload)
      } else {
        return context.dispatch('InsertDocument', payload)
      }
    },

    // 症例データの削除.
    //
    // @param {Object} オブジェクトCase (検索に用いるのは DocumentId のみ)
    RemoveDocument (context, payload) {
      if (payload.DocumentId <= 0) {
        return Promise.reject(new Error())
      }
      return context.dispatch('dbRemove', {
        Query: { DocumentId: payload.DocumentId }
      })
        .then(_ => {
          context.commit('RemoveDatastore', { DocumentId: payload.DocumentId })
          return context.dispatch('ReloadDocumentList')
        })
    },

    // 症例データのもつ DateOfProcedure から年次と症例数を集計したobjectを返す(async-promise)
    //
    GetYears (context) {
      return context.dispatch('dbFind',
        {
          Query: { DocumentId: { $gt: 0 } },
          Projection: { DateOfProcedure: 1, _id: 0 },
          Sort: { DateOfProcedure: -1 }

        })
        .then(documents => {
          const CountByYear = {}
          for (const document of documents) {
            const year = document.DateOfProcedure.substring(0, 4)

            if (!CountByYear[year]) CountByYear[year] = 0
            CountByYear[year]++
          }
          return Promise.resolve(CountByYear)
        })
    }

  }
})

export default store

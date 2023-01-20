import Vue from 'vue'
import Vuex from 'vuex'
import * as NedbAccess from 'depmodules/NedbAccess'
import system from '@/store/modules/system'
import password from '@/store/modules/passwordauth'
import { parseProcedureTime } from '@/modules/ProcedureTimes'
Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    system, password
  },
  state: {
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
    // データベースが保持しているドキュメントの数を返す.
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
      const filters = (state.Filters && [...state.Filters]) || []
      const sort = (state.Sort && { ...state.Sort }) || { DocumentId: -1 }
      const query = {}

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
    SetFilters (state, payload) {
      const newFilters = Array.isArray(payload) ? payload : state.system.settings.View.Filters
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
      return NedbAccess.Insert(payload)
    },
    // Find documents
    // @Param {Object} Query, Projection, Sort,
    // @Param {Number} Skip, Limit
    dbFind (context, payload) {
      return NedbAccess.Find(payload)
    },
    // Find a first document
    // @Param {Object} Query, Projection, Sort,
    // @Param {Number} Skip
    dbFindOne (context, payload) {
      return NedbAccess.FindOne(payload)
    },
    // Find a document by hash
    // @Param {String} Hash
    // @Param {Number} SALT
    dbFindOneByHash (context, payload) {
      return NedbAccess.FindOneByHash(payload)
    },
    // Count matched documents
    // @Param {Object} Query
    dbCount (context, payload) {
      return NedbAccess.Count(payload)
    },
    // Update documents
    // @Param {Object} Query, Update, Options
    dbUpdate (context, payload) {
      return NedbAccess.Update(payload)
    },
    // Remove documents
    // @Param {Object} Query, Options
    dbRemove (context, payload) {
      return NedbAccess.Remove(payload)
    },

    // DocumentIdリストの更新. データベースの操作後は必ず実行する.
    //
    //
    async ReloadDocumentList (context) {
      try {
        const Projection = { DocumentId: 1, _id: 0 }
        let documents = []

        // 通常のFind
        if (context.getters.ViewQuery.Query.Hash === undefined) {
          // 手術時間でのソートは負荷が高いのでデータベースではなく返り値に対してソートを行う
          if (context.getters.ViewQuery.Sort.ProcedureTime === undefined) {
            documents = await context.dispatch('dbFind',
              {
                Query: context.getters.ViewQuery.Query,
                Sort: context.getters.ViewQuery.Sort,
                Projection
              }
            )
          } else {
            // 手術時間でのソート
            const querySort = Object.assign({}, context.getters.ViewQuery.Sort)
            const direction = querySort.ProcedureTime
            delete querySort.ProcedureTime

            // ソートのためProcedureTimeも読み込む
            Projection.ProcedureTime = 1

            documents = (await context.dispatch('dbFind',
              {
                Query: context.getters.ViewQuery.Query,
                Sort: querySort,
                Projection
              }
            )).sort((a, b) => {
              const valueA = parseProcedureTime(a.ProcedureTime)
              const valueB = parseProcedureTime(b.ProcedureTime)
              return valueA === valueB ? 0 : valueA < valueB ? -1 * direction : 1 * direction
            })
          }
        } else {
          // Hashを対象としたFindを実行
          const documentId = await context.dispatch('dbFindOneByHash',
            {
              Hash: context.getters.ViewQuery.Query.Hash,
              SALT: context.getters['system/SALT']
            }
          )
          if (documentId !== undefined) {
            documents = [{ DocumentId: documentId }]
          }
        }

        context.commit('SetDocumentIds',
          {
            DocumentIds: documents.map(doc => doc.DocumentId)
          }
        )
        context.commit('SetTotalDocumentCount',
          await context.dispatch('dbCount', { Query: { DocumentId: { $gt: 0 } } })
        )
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error(error)
        }
        throw new Error('データベースエラー(FIND)です.')
      }
    },

    // ドキュメントのキャッシュへの取得. ドキュメント内容自体はgettersを経由する
    // await $store.dispatch('FetchDocument', { DocumentId: foo })
    // document = $store.getters.CaseDocument( foo )
    //
    // @Param {Object} DocumentIdのみのオブジェクト
    async FetchDocument (context, payload) {
      if (!payload.DocumentId) {
        return undefined
      }

      // 既にロードされているデータであればキャッシュから取得する
      const DataStoreIndex = context.state.DataStore.findIndex(item => item.DocumentId === payload.DocumentId)
      if (DataStoreIndex !== -1) {
        return DataStoreIndex
      } else {
        // キャッシュされていないデータなので読み込んでDatastoreにキャッシュする
        try {
          context.commit('SetDatastore',
            await context.dispatch('dbFindOne', { Query: { DocumentId: payload.DocumentId }, Projection: { _id: 0 } })
          )
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.error(error)
          }
          throw new Error('データベースエラー(FINDONE)です.')
        }
      }
    },
    // 症例データの新規登録. 同一日時に同一IDの症例は登録出来ない.
    //
    // @param {Object} オブジェクトCase
    async InsertDocument (context, payload) {
      try {
        // 重複入力の確認
        const count = await context.dispatch('dbCount', {
          Query: {
            PatientId: payload.PatientId,
            DateOfProcedure: payload.DateOfProcedure
          }
        })
        if (count > 0) {
          throw new Error('DUP')
        }
      } catch (error) {
        if (error.message === 'DUP') {
          throw new Error(`同一日(${payload.DateOfProcedure})に同一ID(${payload.PatientId})の症例は登録できません.`)
        } else {
          if (process.env.NODE_ENV !== 'production') {
            console.error(error)
          }
          throw new Error('データベースエラー(INSERT/UPDATE)です.')
        }
      }

      try {
        // 仮登録 DocumentId = '__auto__' のドキュメントをinsert
        payload.DocumentId = '__autoid__'
        await context.dispatch('dbInsert', {
          Document: payload
        })

        // 疑似トランザクション
        try {
          // 連番取得
          const sequencerow = await context.dispatch('dbFindOne', {
            Query: { sequence: 'maindb' }
          })
          const newid = (sequencerow ? sequencerow.number : 0) + 1

          await context.dispatch('dbUpdate', {
            Query: { sequence: 'maindb' },
            Update: { sequence: 'maindb', number: newid },
            Options: { upsert: true }
          })

          // 登録の確定
          context.dispatch('dbUpdate', {
            Query: { DocumentId: '__autoid__' },
            Update: { $set: { DocumentId: newid } },
            Options: {}
          })
        } catch (error) {
          // 連番付与登録に失敗した場合rollback, 連番についてはrollbackせずそのまま放置
          await context.dispatch('dbRemove', {
            Query: {
              DocumentId: '__autoid__'
            },
            Options: {
              multi: true
            }
          })
          throw error
        }
        // 疑似トランザクション終了

        // レコード操作をしたら必ずキャッシュをリロード
        await context.dispatch('ReloadDocumentList')
      } catch (error) {
        // Insertに失敗
        if (process.env.NODE_ENV !== 'production') {
          console.error(error)
        }
        throw new Error('データベースエラー(INSERT)です.')
      }
    },

    // 症例データの更新. Case.DocumentId をキーとするため、有効な DocumentId であることが必須.
    // 同一日時に同一IDの症例は登録出来ない.
    //
    // @param {Object} オブジェクトCase
    async ReplaceDocument (context, payload) {
      if (payload.DocumentId <= 0) {
        throw new Error('内部IDの指定に問題があります.')
      }
      try {
        // 重複入力の確認
        const documents = await context.dispatch('dbFind', {
          Query: {
            PatientId: payload.PatientId,
            DateOfProcedure: payload.DateOfProcedure
          },
          Projection: { DocumentId: 1 }
        })
        for (const document of documents) {
          if (document.DocumentId !== payload.DocumentId) {
            throw new Error('同一日に同一IDの症例は登録できません.')
          }
        }
      } catch (error) {
        if (error.message === 'DUP') {
          throw new Error(`同一日(${payload.DateOfProcedure})に同一ID(${payload.PatientId})の症例は登録できません.`)
        } else {
          if (process.env.NODE_ENV !== 'production') {
            console.error(error)
          }
          throw new Error('データベースエラー(UPDATE)です.')
        }
      }

      try {
        await context.dispatch('dbUpdate', {
          Query: { DocumentId: payload.DocumentId },
          Update: payload,
          Options: {}
        })

        // 変更のあったDocumentIdをキャッシュから削除
        context.commit('RemoveDatastore', { DocumentId: payload.DocumentId })

        // レコード操作をしたら必ずキャッシュをリロード
        await context.dispatch('ReloadDocumentList')
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error(error)
        }
        throw new Error('データベースエラー(UPDATE)です.')
      }
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
    async RemoveDocument (context, payload) {
      if (payload.DocumentId <= 0) {
        throw new Error('内部IDの指定に問題があります.')
      }

      try {
        await context.dispatch('dbRemove', {
          Query: { DocumentId: payload.DocumentId }
        })
        // 変更のあったDocumentIdをキャッシュから削除
        context.commit('RemoveDatastore', { DocumentId: payload.DocumentId })

        // レコード操作をしたら必ずキャッシュをリロード
        await context.dispatch('ReloadDocumentList')
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error(error)
        }
        throw new Error('データベースエラー(REMOVE)です.')
      }
    },

    // 症例データのもつ DateOfProcedure から年次と症例数を集計したobjectを返す
    //
    async GetYears (context) {
      const documents = await context.dispatch('dbFind',
        {
          Query: { DocumentId: { $gt: 0 } },
          Projection: { DateOfProcedure: 1, _id: 0 }
        })
      const CountByYear = {}
      for (const document of documents) {
        const year = document.DateOfProcedure.substring(0, 4)
        CountByYear[year] = (CountByYear[year] === undefined) ? 1 : CountByYear[year] + 1
      }
      return CountByYear
    }
  }
})

export default store

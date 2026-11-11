import { version as VueVersionString } from 'vue'
import HHX from 'xxhashjs'
import { LoadConfig, SaveConfig, GetSystemInfo } from 'depmodules/config'

export default {
  namespaced: true,
  state: {
    settings: {
      // システム固有のソルト値
      Salt: 0,
      // 施設情報
      InstitutionName: '',
      InstitutionID: '',
      JSOGoncologyboardID: '',
      // 編集設定
      EditJSOGId: true,
      EditNCDId: false,
      ShowNote: true,
      Approach: '{}',
      // 表示設定
      ShowStartupDialog: true,
      EnableAdvancedSettings: true,
      View: {
        Filters: [],
        Sort: {
          DocumentId: -1
        }
      },
      // エクスポート設定
      UnlockExportJSOGId: false,
      UnlockExportNCDId: false,
      CSVruleset: '{}'
    },
    StartupDialogStatus: true,
    Platform: ''
  },
  getters: {
    // システム固有のソルト値
    SALT(state: any) {
      return state.settings.Salt
    },
    // SALTを用いてハッシュ化する
    // @param {object} $.key - ハッシュ化する文字列 $.compatibility - 2021年以前の互換性を持たせるか
    generateHash(state: any) {
      return function (value: string, compatibility = false) {
        const Encoder = new TextEncoder()
        // 2021年以前はsaltを数値として渡していたためJavaScriptの浮動小数点のビット数制限を受ける
        if (compatibility) {
          return HHX.h64(
            Encoder.encode(value).buffer,
            String(state.settings.Salt)
          ).toString(36)
        } else {
          return HHX.h64(
            Encoder.encode(value).buffer,
            String(state.settings.Salt)
          ).toString(36)
        }
      }
    },
    // APP_NAMEの中継
    ApplicationName() {
      return import.meta.env.VITE_APP_NAME
    },
    // APP_VERSIONの中継(Viteのdefineで埋め込み)
    ApplicationVersion() {
      return __APP_VERSION__ || 'undefined'
    },
    // Vueのバージョンの中継
    VueVersion() {
      return VueVersionString || 'undefined'
    },
    // 実行プラットフォーム情報
    Platform(state: any) {
      return state.Platform
    },

    // settingsオブジェクト全体
    Settings(state: any) {
      return state.settings
    },

    // 施設情報オブジェクト
    InstituteInformation(state: any) {
      return {
        InstitutionName: state.settings.InstitutionName,
        InstitutionID: state.settings.InstitutionID,
        JSOGoncologyboardID: state.settings.JSOGoncologyboardID
      }
    },
    // 施設名
    InstitutionName(state: any) {
      return state.settings.InstitutionName
    },
    // 施設コード
    InstitutionID(state: any) {
      return state.settings.InstitutionID
    },
    // 日産婦腫瘍登録施設番号
    JSOGInstitutionID(state: any) {
      return state.settings.JSOGoncologyboardID
    },

    // 日産婦腫瘍登録番号の編集可否
    EditJSOGId(state: any) {
      return state.settings.EditJSOGId
    },
    // NCD登録番号の編集可否
    EditNCDId(state: any) {
      return state.settings.EditNCDId
    },
    // メモ編集の自動表示設定
    ShowNote(state: any) {
      return state.settings.ShowNote
    },
    // アプローチのデフォルト設定
    Approach(state: any) {
      return state.settings.Approach || '{}'
    },

    // 起動時のメッセージダイアログ表示の有無
    ShowStartupDialog(state: any) {
      return state.StartupDialogStatus
    },

    // 高度な設定の利用可否
    EnableAdvancedSettings(state: any) {
      return state.settings.EnableAdvancedSettings
    },

    // 表示設定の保存値
    SavedView(state: any) {
      return state.settings.View
    },
    // CSVインポートのルール保存値
    SavedCSVrule(state: any) {
      return state.settings.CSVruleset
    }
  },
  mutations: {
    // settingsにオブジェクトから値をコピー
    //
    // @param {object}
    SetPreferences(state: any, payload: any = {}) {
      for (const key in payload) {
        if (state.settings[key] !== undefined) {
          if (typeof state.settings[key] !== 'object') {
            state.settings[key] = payload[key]
          } else {
            state.settings[key] = Object.assign(
              state.settings[key],
              payload[key]
            )
          }
        }
      }
    },
    // 表示設定を保存
    //
    // @param {object}
    SetView(state: any, payload: any = {}) {
      const newView: any = {}
      if (payload.Filters) {
        newView.Filters = payload.Filters
      }
      if (payload.Sort) {
        newView.Sort = payload.Sort
      }

      state.settings.View = Object.assign(
        {
          Filters: [],
          Sort: {
            DocumentId: -1
          }
        },
        // state.settings.View,
        newView
      )
    },
    // 起動時のメッセージダイアログ表示フラグ設定
    //
    // @param{boolean}
    CloseStartupDialog(state: any) {
      state.StartupDialogStatus = false
    },
    // 実行プラットフォーム情報設定
    //
    // @param{string}
    SetPlatform(state: any, payload: any) {
      state.Platform = payload
    }
  },
  actions: {
    // 設定(ファイル)から設定を読み込みストアに反映する
    // @return {Promise<object>} settingsオブジェクト
    async LoadPreferences(context: any) {
      const settings: any = (await LoadConfig(context))?.Settings || {}

      context.commit('SetPreferences', settings)
      context.commit('SetFilters', settings?.View?.Filters, { root: true })
      context.commit('SetSort', settings?.View?.Sort, { root: true })

      if (settings?.ShowStartupDialog === false) {
        context.commit('CloseStartupDialog')
      }

      return settings
    },
    // 設定(ファイル)にストアの状況を保存する
    //
    SavePreferences(context: any) {
      return SaveConfig(context.state.settings, context)
    },
    // 起動時のメッセージダイアログ表示を設定・保存する
    //
    async SetAndSaveShowStartupDialog(context: any, value: any) {
      context.commit('SetPreferences', { ShowStartupDialog: !!value })
      await context.dispatch('SavePreferences')
    },
    // 現在の表示設定を保存する
    //
    async SaveCurrentView(context: any) {
      context.commit('SetView', {
        Filters: context.rootState.Filters,
        Sort: context.rootState.Sort
      })
      await context.dispatch('SavePreferences')
    },
    // 実行環境情報を取得保存する
    //
    async getPlatformInfo(context: any) {
      const platformInfo = await GetSystemInfo()
      context.commit('SetPlatform', platformInfo)
    }
  }
}

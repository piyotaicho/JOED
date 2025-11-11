import { version as VueVersionString } from 'vue'
import HHX from 'xxhashjs'
import { LoadConfig, SaveConfig } from 'depmodules/config'

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
    StartupDialogStatus: true
  },
  getters: {
    // システム固有のソルト値
    SALT(state) {
      return state.settings.Salt
    },
    // SALTを用いてハッシュ化する
    // @param {object} $.key - ハッシュ化する文字列 $.compatibility - 2021年以前の互換性を持たせるか
    generateHash(state) {
      return function (value, compatibility = false) {
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
    // APP_VERSIONの中継
    ApplicationVersion() {
      return __APP_VERSION__ || 'undefined'
    },
    // Vueのバージョンの中継
    VueVersion() {
      return VueVersionString || 'undefined'
    },
    // 実行プラットフォーム - 可能な限り検出する
    Platform() {
      return import.meta.env.VITE_APP_ELECTRON
        ? window?.Versions?.Platform()
        : (
          (
            window.navigator?.platform ||
            window.navigator?.userAgentData?.platform ||
            'win32'
          ).includes('Mac')
            ? 'darwin'
            : 'win32'
        )
    },

    // settingsオブジェクト全体
    Settings(state) {
      return state.settings
    },

    // 施設情報オブジェクト
    InstituteInformation(state) {
      return {
        InstitutionName: state.settings.InstitutionName,
        InstitutionID: state.settings.InstitutionID,
        JSOGoncologyboardID: state.settings.JSOGoncologyboardID
      }
    },
    // 施設名
    InstitutionName(state) {
      return state.settings.InstitutionName
    },
    // 施設コード
    InstitutionID(state) {
      return state.settings.InstitutionID
    },
    // 日産婦腫瘍登録施設番号
    JSOGInstitutionID(state) {
      return state.settings.JSOGoncologyboardID
    },

    // 日産婦腫瘍登録番号の編集可否
    EditJSOGId(state) {
      return state.settings.EditJSOGId
    },
    // NCD登録番号の編集可否
    EditNCDId(state) {
      return state.settings.EditNCDId
    },
    // メモ編集の自動表示設定
    ShowNote(state) {
      return state.settings.ShowNote
    },
    // アプローチのデフォルト設定
    Approach(state) {
      return state.settings.Approach || '{}'
    },

    // 起動時のメッセージダイアログ表示の有無
    ShowStartupDialog(state) {
      return state.StartupDialogStatus
    },

    // 表示設定の保存値
    SavedView(state) {
      return state.settings.View
    },
    // CSVインポートのルール保存値
    SavedCSVrule(state) {
      return state.settings.CSVruleset
    }
  },
  mutations: {
    // settingsにオブジェクトから値をコピー
    //
    // @param {object}
    SetPreferences(state, payload = {}) {
      for (const key in payload) {
        if (state.settings[key] !== undefined) {
          state.settings[key] = payload[key]
        }
      }
    },
    // 表示設定を保存
    //
    // @param {object}
    SetView(state, payload = {}) {
      const newView = {}
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
    CloseStartupDialog(state) {
      state.StartupDialogStatus = false
    }
  },
  actions: {
    // 設定(ファイル)から設定を読み込みストアに反映する
    //
    async LoadPreferences(context) {
      const settings = (await LoadConfig(context))?.Settings || {}

      context.commit('SetPreferences', settings)
      context.commit('SetFilters', settings?.View?.Filters, { root: true })
      context.commit('SetSort', settings?.View?.Sort, { root: true })

      if (settings?.ShowStartupDialog === false) {
        context.commit('CloseStartupDialog')
      }
    },
    // 設定(ファイル)にストアの状況を保存する
    //
    SavePreferences(context) {
      return SaveConfig(context.state.settings, context)
    },
    // 起動時のメッセージダイアログ表示を設定・保存する
    //
    async SetAndSaveShowStartupDialog(context, value) {
      context.commit('SetPreferences', { ShowStartupDialog: !!value })
      await context.dispatch('SavePreferences')
    },
    // 現在の表示設定を保存する
    //
    async SaveCurrentView(context) {
      context.commit('SetView', {
        Filters: context.rootState.Filters,
        Sort: context.rootState.Sort
      })
      await context.dispatch('SavePreferences')
    }
  }
}

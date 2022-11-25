import Vue from 'vue'
import { LoadConfig, SaveConfig } from 'depmodules/config'

export default {
  namespaced: true,
  state: {
    settings: {
      Salt: 0,
      InstitutionName: '',
      InstitutionID: '',
      JSOGoncologyboardID: '',
      EditJSOGId: true,
      EditNCDId: false,
      View: {
        Filters: [],
        Sort: {
          DocumentId: -1
        }
      },
      UnlockExportJSOGId: false,
      UnlockExportNCDId: false,
      CSVruleset: '{}',
      ShowStartupDialog: true
    },
    StartupDialogStatus: true
  },
  getters: {
    // システム固有のソルト値
    SALT (state) {
      return state.settings.Salt
    },
    // APP_NAMEの中継
    ApplicationName () {
      return process.env.VUE_APP_ELECTRON
        ? window?.Versions?.ApplicationName()
        : process.env.VUE_APP_NAME
    },
    // APP_VERSIONの中継
    ApplicationVersion () {
      return process.env.VUE_APP_ELECTRON
        ? window?.Versions?.ApplicationVersion()
        : process.env.VUE_APP_VERSION
    },
    // Vueのバージョンの中継
    VueVersion () {
      return Vue.version || 'undefined'
    },
    // 実行プラットフォーム - 可能な限り検出する
    Platform () {
      return process.env.VUE_APP_ELECTRON
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
    Settings (state) {
      return state.settings
    },

    // 施設情報オブジェクト
    InstituteInformation (state) {
      return {
        InstitutionName: state.settings.InstitutionName,
        InstitutionID: state.settings.InstitutionID,
        JSOGoncologyboardID: state.settings.JSOGoncologyboardID
      }
    },
    // 施設名
    InstitutionName (state) {
      return state.settings.InstitutionName
    },
    // 施設番号
    InstitutionID (state) {
      return state.settings.InstitutionID
    },
    // 日産婦腫瘍登録施設番号
    JSOGInstitutionID (state) {
      return state.settings.JSOGoncologyboardID
    },

    // 日産婦腫瘍登録番号の編集可否
    EditJSOGId (state) {
      return state.settings.EditJSOGId
    },
    // NCD登録番号の編集可否
    EditNCDId (state) {
      return state.settings.EditNCDId
    },

    // 日産婦腫瘍登録番号の生データ出力可否
    ExportJSOGId (state) {
      return state.settings.UnlockExportJSOGId
    },
    // NCD登録番号の生データ出力可否
    ExportNCDId (state) {
      return state.settings.UnlockExportNCDId
    },

    // 起動時のメッセージダイアログ表示の有無
    ShowStartupDialog (state) {
      return state.StartupDialogStatus
    },

    // 表示設定の保存値
    SavedView (state) {
      return state.settings.View
    },
    // CSVインポートのルール保存値
    SavedCSVrule (state) {
      return state.settings.CSVruleset
    }
  },
  mutations: {
    // settingsにオブジェクトから値をコピー
    //
    // @param {object}
    SetPreferences (state, payload = {}) {
      for (const key in payload) {
        if (state.settings[key] !== undefined) {
          Vue.set(state.settings, key, payload[key])
        }
      }
    },
    // 表示設定を保存
    //
    // @param {object}
    SetView (state, payload = {}) {
      const newView = {}
      if (payload.Filters) {
        newView.Filters = payload.Filters
      }
      if (payload.Sort) {
        newView.Sort = payload.Sort
      }

      Vue.set(state.settings, 'View', Object.assign(
        {
          Filters: [],
          Sort: {
            DocumentId: -1
          }
        },
        // state.settings.View,
        newView
      ))
    },
    // 起動時のメッセージダイアログ表示フラグ設定
    //
    // @param{boolean}
    CloseStartupDialog (state) {
      state.StartupDialogStatus = false
    }
  },
  actions: {
    // 設定(ファイル)から設定を読み込みストアに反映する
    //
    async LoadPreferences (context) {
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
    SavePreferences (context) {
      return SaveConfig(context.state.settings, context)
    },
    // 起動時のメッセージダイアログ表示を設定・保存する
    //
    async SetAndSaveShowStartupDialog (context, value) {
      context.commit('SetPreferences', { ShowStartupDialog: !!value })
      await context.dispatch('SavePreferences')
    },
    // 現在の表示設定を保存する
    //
    async SaveCurrentView (context) {
      context.commit('SetView', {
        Filters: context.rootState.Filters,
        Sort: context.rootState.Sort
      })
      await context.dispatch('SavePreferences')
    }
  }
}

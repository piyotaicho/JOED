// 保存先は最終的にはデータベースではなく electron.config に逃げる予定
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
      EditNCDId: true,
      View: {
        Filters: [],
        Sort: {
          DocumentId: -1
        }
      },
      CSVruleset: '{}',
      ShowStartupDialog: true
    },
    StartupDialogStatus: true
  },
  getters: {
    SALT (state) {
      return state.settings.Salt
    },
    ApplicationName () {
      return process.env.VUE_APP_NAME
    },
    ApplicationVersion () {
      return process.env.VUE_APP_VERSION
    },
    VueVersion () {
      return Vue.version || 'undefined'
    },
    Platform () {
      return process.env.VUE_APP_ELECTRON
        ? process.platform
        : (window.navigator.platform.includes('Mac') ? 'darwin' : 'win32')
    },

    Settings (state) {
      return state.settings
    },

    InstituteInformation (state) {
      return {
        InstitutionName: state.settings.InstitutionName,
        InstitutionID: state.settings.InstitutionID,
        JSOGoncologyboardID: state.settings.JSOGoncologyboardID
      }
    },
    InstitutionName (state) {
      return state.settings.InstitutionName
    },
    InstitutionID (state) {
      return state.settings.InstitutionID
    },
    JSOGInstitutionID (state) {
      return state.settings.JSOGoncologyboardID
    },

    EditJSOGId (state) {
      return state.settings.EditJSOGId
    },
    EditNCDId (state) {
      return state.settings.EditNCDId
    },

    ShowStartupDialog (state) {
      return state.StartupDialogStatus
    },

    SavedView (state) {
      return state.settings.View
    },

    SavedCSVrule (state) {
      if (state.settings.CSVruleset !== '{}') {
        return JSON.parse(state.settings.CSVruleset)
      } else {
        return {}
      }
    }
  },
  mutations: {
    SetPreferences (state, payload = {}) {
      for (const key of Object.keys(payload)) {
        if (state.settings[key] !== undefined) {
          Vue.set(state.settings, key, payload[key])
        }
      }
    },
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
    CloseStartupDialog (state) {
      state.StartupDialogStatus = false
    }
  },
  actions: {
    LoadPreferences (context) {
      return LoadConfig(context)
        .then(settingdocument => {
          const Settings =
            {
              View: {
                Filters: undefined,
                Sort: undefined
              },
              ...(settingdocument ? settingdocument.Settings : {})
            }

          if (Settings) {
            context.commit('SetPreferences', Settings)
            context.commit('SetFilters', Settings.View.Filters, { root: true })
            context.commit('SetSort', Settings.View.Sort, { root: true })
          }
          if (Settings.ShowStartupDialog === false) {
            context.commit('CloseStartupDialog')
          }
        })
    },
    SavePreferences (context) {
      return SaveConfig(context.state.settings, context)
    },
    async SetAndSaveShowStartupDialog (context, value) {
      context.commit('SetPreferences', { ShowStartupDialog: !!value })
      await context.dispatch('SavePreferences')
    },
    async SaveCurrentView (context) {
      context.commit('SetView', {
        Filters: context.rootState.Filters,
        Sort: context.rootState.Sort
      })
      await context.dispatch('SavePreferences')
    }
  }
}

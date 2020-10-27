// 保存先は最終的にはデータベースではなく electron.config に逃げる予定
import Vue from 'vue'
import { LoadConfig, SaveConfig } from 'depmodules/config'

export default {
  namespaced: true,
  state: {
    settings: {
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
      ShowStartupDialog: true
    },
    StartupDialogStatus: true
  },
  getters: {
    ApplicationName () {
      return process.env.VUE_APP_NAME
    },
    ApplicationVersion () {
      return process.env.VUE_APP_VERSION
    },
    Settings (state) {
      return Object.assign({}, state.settings)
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
    }
  },
  mutations: {
    SetPreferences (state, payload = {}) {
      for (const key of Object.keys(payload)) {
        if (state.settings[key] !== undefined) {
          Vue.set(state.settings, key, payload[key])
        }
      }
      if (state.StartupDialogStatus && !state.settings.ShowStartupDialog) {
        Vue.set(state, 'StartupDialogStatus', false)
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
      Vue.set(state, 'StartupDialogStatus', false)
    }
  },
  actions: {
    LoadPreferences (context) {
      return LoadConfig(context)
        .then(settings => {
          if (settings) {
            context.commit('SetPreferences', settings.Settings)
            context.commit('SetFilters', settings.Settings.View.Filters, { root: true })
            context.commit('SetSort', settings.Settings.View.Sort, { root: true })
          }
          if (settings.ShowStartupDialog === false) {
            context.commit('CloseStartupDialog')
          }
        })
    },
    SavePreferences (context) {
      const settings = JSON.parse(JSON.stringify(context.state.settings))
      return SaveConfig(settings, context)
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

// 保存先は最終的にはデータベースではなく electron.config に逃げる予定
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
      View: {},
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
      return Object.assign({}, state.settings.View)
    }
  },
  mutations: {
    SetPreferences (state, payload = {}) {
      for (const key of Object.keys(payload)) {
        if (state.settings[key] !== undefined) {
          if (key === 'View') {
            // this.$store.commit('SetView', payload.View)
          } else {
            state.settings[key] = payload[key]
          }
        }
      }
    },
    SetView (state, payload = {}) {
      const newView = {}
      if (payload.Filter) {
        newView.Filter = Object.assign([], payload.Filter)
      }
      if (payload.Sort) {
        newView.Sort = Object.assign({}, payload.Sort)
      }

      this.$set(state.settings, 'View', Object.assign(
        {
          Filter: [],
          Sort: {
            field: 'DocumentId',
            order: -1
          }
        },
        state.settings.View,
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
        .then(settings => {
          if (settings) {
            context.commit('SetPreferences', settings.Settings)
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
    SetAndSaveShowStartupDialog (context, value) {
      context.commit('SetPreferences', { ShowStartupDialog: !!value })
      context.dispatch('SavePreferences')
    }
  }
}

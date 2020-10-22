// 保存先は最終的にはデータベースではなく electron.config に逃げる予定
import { LoadConfig, SaveConfig } from 'depmodules/config'

export default {
  namespaced: true,
  state: {
    InstitutionName: '',
    InstitutionID: '',
    JSOGoncologyboardID: '',
    ShowWelcomeMessage: true,
    DefaultViewSetting: {
      Filter: [],
      Sort: {
        field: 'DocumentId',
        order: -1
      }
    },
    EnabledJSOGId: true,
    EnabledNCDId: true
  },
  getters: {
    InstituteInformation (state) {
      return {
        InstitutionName: state.InstitutionName,
        InstitutionID: state.InstitutionID,
        JSOGoncologyboardID: state.JSOGoncologyboardID
      }
    },
    InstitutionName (state) {
      return state.InstitutionName
    },
    InstitutionID (state) {
      return state.InstitutionID
    },
    JSOGInstitutionID (state) {
      return state.JSOGoncologyboardID
    },
    EditJSOGId (state) {
      return state.EnabledJSOGId
    },
    EditNCDId (state) {
      return state.EnabledNCDId
    },
    ShowWelcomeMessage (state) {
      return state.ShowWelcomeMessage
    },
    DefaultViewSetting (state) {
      return state.DefaultViewSetting
    }
  },
  mutations: {
    SetPreferences (state, payloads = {}) {
      for (const key of Object.keys(payloads)) {
        if (state[key] !== undefined) {
          state[key] = payloads[key]
        }
      }
    }
  },
  actions: {
    LoadPreferences (context) {
      /*
      return context.dispatch('dbFindOne', {
        Query: { Settings: { $exists: true } }
      },
      { root: true })
      */
      return LoadConfig(context)
        .then(settings => {
          if (settings !== null) {
            context.commit('SetPreferences', settings.Settings)
          }
        })
    },
    SavePreferences (context) {
      const temporaryState = {}
      for (const key of Object.keys(context.state)) {
        temporaryState[key] = context.state[key]
      }

      /*
      return context.dispatch('dbUpdate', {
        Query: { Settings: { $exists: true } },
        Update: { Settings: temporaryState },
        Options: { upsert: true }
      },
      { root: true })
      */
      return SaveConfig(temporaryState, context)
    },
    SetShowWelcomeMessage (context, value) {
      context.commit('SetPreferences', { ShowWelcomeMessage: value })
    }
  }
}

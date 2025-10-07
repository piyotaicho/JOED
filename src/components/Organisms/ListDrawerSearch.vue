<script>
import { computed, reactive } from 'vue'
import { useStore } from '@/store'
import InputSwitchField from '@/components/Molecules/InputSwitchField.vue'

// private 定数 関数
const makeRegex = (str = '', regex = false) => {
  let queryRegex
  if (regex) {
    try {
      queryRegex = new RegExp(str, 'i')
    } catch {
      queryRegex = new RegExp()
    }
  } else {
    // 文字列の正規表現シンタックスをエスケープして文字列検索パターンを生成
    queryRegex = new RegExp(str.replace(/[\\/.*+?^$-|()\][]/g, c => '\\' + c), 'i')
  }
  return queryRegex
}

const SearchSetting = {
  Id: {
    title: '患者ID',
    regexp: false,
    multiple: true,
    createquery: (query) => {
      const queries = query.split(/[\s,，]+/)
        .map(item => item
          .replace(/[-ｰー－～]/g, '')
          .replace(/./g, c => c + '[-ｰー－～]*')
        )

      if (queries.length > 0) {
        const regexp = '^(' + queries.join('|') + ')$'
        return {
          PatientId: { $regex: new RegExp(regexp) }
        }
      } else {
        return undefined
      }
    }
  },
  Name: {
    title: '患者名',
    regexp: true,
    createquery: (query, regexp) => {
      return { Name: { $regex: makeRegex(query, regexp) } }
    }
  },
  Diagnoses: {
    title: '手術診断',
    regexp: true,
    createquery: (query, regexp) => {
      return {
        Diagnoses: {
          $elemMatch: {
            Text: { $regex: makeRegex(query, regexp) }
          }
        }
      }
    }
  },
  DiagnosesMain: {
    title: '主たる手術診断',
    regexp: true,
    createquery: (query, regexp) => {
      return {
        'Diagnoses.0.Text': { $regex: makeRegex(query, regexp) }
      }
    }
  },
  Procedures: {
    title: '実施手術',
    regexp: true,
    createquery: (query, regexp) => {
      return {
        $or: [
          {
            Procedures: {
              $elemMatch: {
                Text: { $regex: makeRegex(query, regexp) }
              }
            }
          },
          {
            Diagnoses: {
              $elemMatch: {
                'AdditionalProcedure.Text': { $regex: makeRegex(query, regexp) }
              }
            }
          }
        ]
      }
    }
  },
  ProceduresMain: {
    title: '主たる実施手術',
    regexp: true,
    createquery: (query, regexp) => {
      return {
        'Procedures.0.Text': { $regex: makeRegex(query, regexp) }
      }
    }
  },
  Hash: {
    title: '問い合わせレコード識別子',
    regexp: false,
    multiple: false,
    createquery: (query) => {
      if (query && query.trim().length > 0) {
        return { Hash: query.trim() }
      } else {
        return undefined
      }
    }
  }
}

export default {
  components: {
    InputSwitchField
  },
  emits: ['changed'],
  setup (_props, { emit }) {
    const store = useStore()
    const setting = reactive({
      IgnoreQuery: false,
      UseRegexp: false,
      Field: '',
      Search: ''
    })

    const created = () => {
      if (store.getters.ViewSettings.Search) {
        const preservedSearch = JSON.parse(store.getters.ViewSettings.Search.Preserve || '{}')

        for (const key in setting) {
          if (preservedSearch[key] !== undefined) {
            setting[key] = preservedSearch[key]
          }
        }
      }
    }
    created()

    const SearchActivated = computed(() => store.getters.SearchActivated)

    const RegexpDisabled = computed(() => {
      const preset = SearchSetting[setting.Field]

      if (preset && preset.regexp !== undefined) {
        return !preset.regexp
      } else {
        return true
      }
    })

    const MultipleQueryAccepted = computed(() => {
      const preset = SearchSetting[setting.Field]

      if (preset && preset.multiple !== undefined) {
        return SearchSetting[setting.Field].multiple
      } else {
        return false
      }
    })

    const performQuery = () => {
      if (setting.Field && setting.Search) {
        const query = Object.entries(
          SearchSetting[setting.Field].createquery(setting.Search, setting.UseRegexp) || {}
        )[0]

        if (query && query.length === 2) {
          store.commit('SetSearch', {
            IgnoreQuery: setting.IgnoreQuery,
            Filter: {
              Field: query[0],
              Value: query[1]
            },
            Preserve: JSON.stringify(setting)
          })
          emit('changed')
        }
      }
    }

    const cancelQuery = () => {
      store.commit('SetSearch', {
        Filter: {}
      })
      emit('changed')
    }

    return {
      setting, SearchActivated, RegexpDisabled, MultipleQueryAccepted, performQuery, cancelQuery
    }
  }
}
</script>

<template>
  <div class="menu-item">
    <div class="subtilte-section">検索対象</div>
    <div>
      <InputSwitchField
        v-model="setting.IgnoreQuery"
        title=""
        :options="{ 全データ: true, 現在の表示設定: false }"
      />
    </div>
    <div class="menu-item-content">
      <div>
        <div>
          <select v-model="setting.Field">
            <option value="" disabled style="display: none;">検索する項目を選択してください.</option>
            <option value="Id">患者ID</option>
            <option value="Name">患者名</option>
            <option value="Diagnoses">手術診断</option>
            <option value="DiagnosesMain">手術診断 (主たる診断のみ)</option>
            <option value="Procedures">実施手術</option>
            <option value="ProceduresMain">実施手術 (主たる手術のみ)</option>
            <option value="Hash">問い合わせレコード識別子</option>
          </select>
        </div>
      </div>
    </div>

    <div class="subtilte-section">
      検索内容
      <span style="font-size: 0.8rem;" v-show="MultipleQueryAccepted">
        区切り文字で区切って複数の検索が可能です.
      </span>
    </div>
    <div class="menu-item-content">
      <input type="text" v-model="setting.Search" />
    </div>
    <div>
      <InputSwitchField
        v-model="setting.UseRegexp"
        title=""
        :options="{ 部分一致: false, 正規表現: true }"
        :disabled="RegexpDisabled"
      />
    </div>

    <div class="menu-item-bottom">
      <el-button type="primary" :disabled="setting.Field === '' || setting.Search.trim() === ''" @click="performQuery">検索</el-button>
      <el-button type="success" :disabled="!SearchActivated" @click="cancelQuery">検索の解除</el-button>
    </div>
  </div>
</template>

<template>
  <div class="menu-item">
    <div class="subtilte-section">検索対象</div>
    <div>
      <InputSwitchField
        v-model="IgnoreQuery"
        title=""
        :options="{ 全データ: true, 現在の表示設定: false }"
      />
    </div>
    <div class="menu-item-content">
      <div>
        <div>
          <select v-model="Field">
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
      <input type="text" v-model="Search" />
    </div>
    <div>
      <InputSwitchField
        v-model="UseRegexp"
        title=""
        :options="{ 部分一致: false, 正規表現: true }"
        :disabled="RegexpDisabled"
      />
    </div>

    <div class="menu-item-bottom">
      <el-button type="primary" :disabled="Field === '' || Search.trim() === ''" @click="performQuery">検索</el-button>
      <el-button type="success" :disabled="!SearchActivated" @click="cancelQuery">検索の解除</el-button>
    </div>
  </div>
</template>

<script>
import InputSwitchField from '@/components/Molecules/InputSwitchField'

function makeRegex (str = '', regex = false) {
  let queryRegex
  if (regex) {
    try {
      queryRegex = new RegExp(str, 'i')
    } catch {
      queryRegex = new RegExp()
    }
  } else {
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
      if (query.trim().length > 0) {
        return { Hash: query.trim() }
      } else {
        return undefined
      }
    }
  }
}

export default {
  name: 'ListSearch',
  components: {
    InputSwitchField
  },
  data () {
    return ({
      IgnoreQuery: false,
      UseRegexp: false,
      Field: '',
      Search: ''
    })
  },
  created () {
    if (this.$store.getters.ViewSettings.Search) {
      const settings = JSON.parse(this.$store.getters.ViewSettings.Search.Preserve || '{}')

      Object.keys(this.$data).forEach(key => {
        if (settings[key] !== undefined) {
          this.$data[key] = settings[key]
        }
      })
    }
  },
  computed: {
    SearchActivated () {
      return this.$store.getters.SearchActivated
    },
    RegexpDisabled () {
      return (
        SearchSetting[this.Field] &&
        SearchSetting[this.Field].regexp !== undefined
      )
        ? !SearchSetting[this.Field].regexp
        : true
    },
    MultipleQueryAccepted () {
      return (
        SearchSetting[this.Field] &&
        SearchSetting[this.Field].multiple !== undefined
      )
        ? SearchSetting[this.Field].multiple
        : false
    }
  },
  methods: {
    performQuery () {
      if (this.Field && this.Search) {
        const query = Object.entries(
          SearchSetting[this.Field].createquery(this.Search, this.UseRegexp) || {}
        )[0]

        if (query && query.length === 2) {
          this.$store.commit('SetSearch', {
            IgnoreQuery: this.IgnoreQuery,
            Filter: {
              Field: query[0],
              Value: query[1]
            },
            Preserve: JSON.stringify(this.$data)
          })
          this.$emit('changed')
        }
      }
    },
    cancelQuery () {
      this.$store.commit('SetSearch', {
        Filter: {}
      })
      this.$emit('changed')
    }
  }
}
</script>

<template>
  <div class="menu-item">
    <div class="subtilte-section">検索対象</div>
    <div class="menu-item-content">
      <div>
        <div>
          <select v-model="Field"> <!-- @change="changeSelection"> -->
            <option value="" disabled style="display: none;">検索する項目を選択してください.</option>
            <option value="Id">患者ID</option>
            <option value="Name">患者名</option>
            <option value="Procedures">手術診断</option>
            <option value="Diagnoses">実施手術</option>
            <option value="QID">問い合わせ番号</option>
          </select>
        </div>
      </div>
    </div>
    <div class="subtilte-section">検索内容</div>
    <div class="menu-item-content">
      <input type="text" v-model="SearchString" />
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
      <el-button type="primary" @click="performQuery">検索</el-button>
      <el-button type="success" @click="cancelQuery">検索の解除</el-button>
    </div>
  </div>
</template>

<script>
import InputSwitchField from '@/components/Molecules/InputSwitchField'
import { UniqueIDFormat } from '@/modules/CaseValidater'

const SearchSetting = {
  Id: {
    regexp: false,
    multiple: true,
    createquery: (query) => {
      const queries = query.split(/[\s,，]+/).map(item => item.replace(/[-ｰー－～]/g, ''))

      if (queries.length > 0) {
        const queryRegex = new RegExp('^(' + queries.join('|') + ')$')
        return {
          $where: function () {
            return this.PatientId
              .replace(/[-ｰー－～]/g, '')
              .match(queryRegex) !== null
          }
        }
      } else {
        return null
      }
    }
  },
  Name: {
    regexp: true,
    createquery: (query, regexp) => {
      if (regexp) {
        let queryRegex
        try {
          queryRegex = new RegExp(query)
        } catch {
          return null
        }
        return { Name: { $regex: queryRegex } }
      } else {
        return { $where: function () { return this.Name.includes(query) } }
      }
    }
  },
  Diagnoses: {
    regexp: true,
    createquery: (query, regexp) => {
      if (regexp) {
        let queryRegex
        try {
          queryRegex = new RegExp(query)
        } catch {
          return null
        }
        return {
          $where: function () {
            return this.Diagnoses
              .filter(item => item.Text.match(queryRegex) !== null)
              .length > 0
          }
        }
      } else {
        return {
          $where: function () {
            return this.Diagnoses
              .filter(item => item.Text.includes(query))
              .length > 0
          }
        }
      }
    }
  },
  Procedures: {
    regexp: true,
    createquery: (query, regexp) => {
      if (regexp) {
        let queryRegex
        try {
          queryRegex = new RegExp(query)
        } catch {
          return null
        }
        return {
          $where: function () {
            return this.Procedures
              .filter(
                item => queryRegex.test(item.Text) ||
                (
                  item.AdditionalProcedure &&
                  query.RegEx(item.AdditionalProcedure.Text)
                )
              )
              .length > 0
          }
        }
      } else {
        return {
          $where: function () {
            return this.Procedures
              .filter(
                item => item.Text.includes(query) ||
                (
                  item.AdditionalProcedure &&
                  item.AdditionalProcedure.Text.includes(query)
                )
              )
              .length > 0
          }
        }
      }
    }
  },
  QID: {
    regexp: false,
    multiple: true,
    createquery: (query) => {
      const queryRegex = new RegExp(UniqueIDFormat)
      const queries = query.split(/[\s,，]+/).filter(query => queryRegex.test(query))

      if (queries.length > 0) {
        return { UniqueID: { $in: [...queries] } }
      } else {
        return null
      }
    }
  }
}

export default {
  name: 'Search',
  components: {
    InputSwitchField
  },
  data () {
    return ({
      UseRegexp: false,
      FindMulti: false,
      Field: '',
      SearchString: ''
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
      /*
      if (settings.UseRegexp !== undefined) this.UseRegexp = settings.UseRegexp
      if (settings.FindMulti !== undefined) this.FindMulti = settings.FindMulti
      if (settings.Field !== undefined) this.Field = settings.Field
      if (settings.SearchString !== undefined) this.SearchString = settings.SearchString
      */
    }
  },
  computed: {
    RegexpDisabled () {
      return (SearchSetting[this.Field] && SearchSetting[this.Field].regexp !== undefined) ? !SearchSetting[this.Field].regexp : true
    }
  },
  methods: {
    /*
    changeSelection () {
      if (SearchSetting[this.Field].regexp === false) {
        this.UseRegexp = undefined
      }
    },
    */
    performQuery () {
      if (this.Field && this.SearchString && SearchSetting[this.Field]) {
        const query = Object.entries(SearchSetting[this.Field].createquery(this.SearchString, this.UseRegexp) || {})[0]
        if (query.length === 2) {
          console.log('Search keyvalue: ', query)
          this.$store.commit('SetSearch', {
            IgnoreQuery: true,
            Filter: {
              Field: query[0],
              Value: query[1]
            },
            Preserve: JSON.stringify(this.$data)
          })
          this.$emit('changed')
          /*, {
            noPreserve: true,
            Filter: [{
              Field: keyvalue[0],
              Value: keyvalue[1]
            }]
          })
          */
        } else {
          console.log('creating query failed.')
        }
      }
    },
    cancelQuery () {
      this.$emit('commit', {
        noPreserve: true,
        Filter: [...this.$store.state.preservedViewSettings.Filter]
      })
    }
  }
}
</script>

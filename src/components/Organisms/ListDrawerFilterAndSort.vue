<template>
  <div class="menu-item">
    <div class="subtitle">表示の順番</div>
    <div class="menu-item-content">
      <div>
        <select v-model="Sort.Item">
          <option value="DocumentId">登録順</option>
          <option value="DateOfProcedure">手術日</option>
          <option value="ProcedureTime">手術時間</option>
          <option value="TypeOfProcedure">カテゴリ</option>
          <option value="Age">年齢</option>
          <option value="PatientId">施設の患者ID</option>
        </select>
      </div>

      <div>
        <el-switch
          v-model="Sort.Order"
          active-text="昇順"
          :active-value="1"
          active-color="var(--color-primary)"
          inactive-text="降順"
          :inactive-value="-1"
          inactive-color="var(--color-primary)" />
      </div>
    </div>

    <div class="subtitle">表示する内容</div>
    <div class="menu-item-content" id="display-item-selection">
      <div><LabeledCheckbox v-model="isFilterItemsEmpty">全て表示する</LabeledCheckbox></div>

      <div>
        <div>カテゴリー</div>
        <div>
          <template v-for="(value, category) in Categories">
            <LabeledCheckbox :key="category" v-model="FilterItems" :value="category"></LabeledCheckbox>
          </template>
        </div>
      </div>

      <div>
        <div>年次</div>
        <div>
          <template v-for="(value, year) in Years">
            <LabeledCheckbox v-model="FilterItems" :key="year" :value="year"></LabeledCheckbox>
          </template>
        </div>
      </div>

      <div>
        <div>情報</div>
        <div>
          <template v-for="(value, condition) in Conditions">
            <LabeledCheckbox :key="condition" v-model="FilterItems" :value="condition"></LabeledCheckbox>
          </template>
        </div>
      </div>

    </div>
    <div class="menu-item-bottom">
      <el-dropdown split-button type="primary" @click="Apply()">
        設定
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="Store()">現在の表示設定を規定として保存</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

      <el-button type="success" style="margin-left: 0.715rem;" @click="Revert()">規定の設定に戻す</el-button>
    </div>
  </div>
</template>

<script>
import LabeledCheckbox from '@/components/Atoms/LabeledCheckbox'
import { CategoryTranslation } from '@/modules/CaseValidater'
import * as Popups from '@/modules/Popups'

export default {
  name: 'FilterAndSort',
  components: { LabeledCheckbox },
  data () {
    return ({
      // カテゴリ: CaterogyTranslation から作成される
      Categories: {},
      // 年次: created()で非同期にロードされる
      Years: {},
      Conditions: {
        合併症あり: { Field: 'PresentAE', Value: true },
        未確認: { Field: 'Imported', Value: true },
        エラーあり: { Field: 'Notification', Value: { $exists: true } }
      },
      FilterItems: [],
      Sort: {
        Item: 'DocumentId',
        Order: -1
      }
    })
  },
  created () {
    // 選択肢項目オブジェクトの初期化
    Object.keys(CategoryTranslation).forEach(categorylabel => {
      this.$set(this.Categories, categorylabel, { Field: 'TypeOfProcedure', Value: categorylabel })
    })
    this.$store.dispatch('GetYears').then((CountByYear) => {
      Object.keys(CountByYear).forEach(year => {
        this.$set(this.Years, year + '年', { Field: 'DateOfProcedure', Value: year })
      })
      this.$nextTick()
    })
    this.ImportSettings()
  },
  computed: {
    isFilterItemsEmpty: {
      get () {
        return this.FilterItems.length === 0
      },
      set (newvalue) {
        if (newvalue) {
          this.FilterItems.splice(0)
        }
      }
    }
  },
  methods: {
    ImportSettings () {
      // 現在の表示をインポート
      const view = this.$store.getters.ViewSettings

      if (view) {
        if (view.Sort && Object.entries(view.Sort).length > 0) {
          this.$set(this.Sort, 'Item', Object.entries(view.Sort)[0][0])
          this.$set(this.Sort, 'Order', Object.entries(view.Sort)[0][1])
        }

        const viewfilters = view.Filters
          ? view.Filters.map(filter => {
            switch (filter.Field) {
              case 'TypeOfProcedure':
                return filter.Value
              case 'DateOfProcedure':
                return filter.Value + '年'
              default:
                for (const condition of Object.keys(this.Conditions)) {
                  if (this.Conditions[condition].Field === filter.Field) {
                    return condition
                  }
                }
                return undefined
            }
          }).filter(item => item)
          : []
        this.FilterItems.splice(0, this.FilterItems.length, ...viewfilters)
      }
    },
    async Apply () {
      const FilterObjects = this.FilterItems
        .map(filter => this.Categories[filter] || this.Years[filter] || this.Conditions[filter])
        .filter(filter => filter)

      this.$store.commit('SetFilters', FilterObjects)
      this.$store.commit('SetSort', { [this.Sort.Item]: this.Sort.Order })
      await this.DisableSearch()
      this.$emit('changed')
    },
    async Store () {
      try {
        await this.$store.dispatch('system/SaveCurrentView')
        Popups.information('現在の表示設定を規定として保存しました.\n環境設定から初期設定にリセットできます.')
        await this.$nextTick()
      } catch {}
    },
    async Revert () {
      this.$store.commit('SetFilters', {})
      this.$store.commit('SetSort', {})
      await this.DisableSearch()
      this.$emit('changed')
      this.ImportSettings()
      this.$nextTick()
    },
    async DisableSearch () {
      if (this.$store.getters.SearchActivated) {
        if (await Popups.confirmYesNo('検索が実行されています.\n検索を解除しますか?')) {
          this.$store.commit('SetSearch', {
            Filter: {}
          })
        }
      }
    }
  }
}
</script>

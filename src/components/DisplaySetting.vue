<template>
  <div class="menu-item">
    <div class="subtitle-section">表示の順番</div>
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

      <el-switch
        v-model="Sort.Order"
        active-text="昇順"
        :active-value="1"
        active-color="var(--color-primary)"
        inactive-text="降順"
        :inactive-value="-1"
        inactive-color="var(--color-primary)" />
    </div>

    <div class="subtitle-section">表示する内容</div>
    <div class="menu-item-content" id="display-item-selection">
      <div><LabeledCheckbox v-model="isFilterItemsEmpty">全て表示する</LabeledCheckbox></div>

      <div>
        <div>カテゴリー</div>
        <div>
          <template v-for="(value, category) in Categories">
            <LabeledCheckbox :key="category" v-model="FilterItems" :value="category">{{category}}</LabeledCheckbox>
          </template>
        </div>
      </div>

      <div>
        <div>年次</div>
        <div>
          <template v-for="(value, year) in Years">
            <LabeledCheckbox v-model="FilterItems" :key="year" :value="year">{{year}}</LabeledCheckbox>
          </template>
        </div>
      </div>

      <div>
        <div>情報</div>
        <div>
          <template v-for="(value, condition) in Conditions">
            <LabeledCheckbox :key="condition" v-model="FilterItems" :value="condition">{{condition}}</LabeledCheckbox>
          </template>
        </div>
      </div>

    </div>
    <div class="menu-item-bottom">
      <el-button type="primary" @click="Apply()">設定</el-button>
      <el-button type="success"  @click="Revert()">初期設定に戻す</el-button>
    </div>
  </div>
</template>

<script>
import LabeledCheckbox from '@/components/Atoms/LabeledCheckbox'
import { CategoryTranslation } from '@/modules/CaseValidater'

export default {
  name: 'DisplaySetting',
  components: { LabeledCheckbox },
  data () {
    return ({
      // カテゴリ: CaterogyTranslation から作成される
      Categories: {},
      // 年次: created()で非同期にロードされる
      Years: {},
      Conditions: {
        合併症あり: { Field: 'PresentAE', Value: true },
        要確認: { Field: 'Imported', Value: true },
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
    // 選択肢オブジェクトの初期化
    Object.keys(CategoryTranslation).forEach(categorylabel => {
      this.$set(this.Categories, categorylabel, { Field: 'TypeOfProcedure', Value: categorylabel })
    })
    this.$store.dispatch('GetYears').then((CountByYear) => {
      Object.keys(CountByYear).forEach(year => {
        this.$set(this.Years, year + '年', { Field: 'DateOfProcedure', Value: year })
      })
    })
    // 現在の表示をロード
    const view = this.$store.getters.ViewSettings
    if (view.Sort) {
      this.$set(this.Sort, 'Item', view.Sort.Item)
      this.$set(this.Sort, 'Order', view.Sort.Order)
    }
    if (view.Filter) {
      const viewfilters = view.Filter.map(filter => {
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
      this.FilterItems.splice(0, this.FilterItems.length, ...viewfilters)
    }
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
    Apply () {
      const FilterObjects = []
      this.FilterItems.forEach(filter => {
        const filterobj = this.Categories[filter] || this.Years[filter] || this.Conditions[filter]
        if (filterobj) {
          FilterObjects.push(filterobj)
        }
      })
      this.$emit('commit', { Sort: this.Sort, Filter: FilterObjects })
    },
    Revert () {
      this.$emit('commit')
    }
  }
}
</script>

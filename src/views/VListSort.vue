<template>
  <div>
    <div id="sort-overlay" @click="closeMenu">
    </div>
    <div id="sort-menu">
      <div class="menu-title">ソート</div>
      <el-select v-model="SortItem">
        <el-option value="SequentialId" label="登録順" />
        <el-option value="DateOfProcedure" label="手術日" />
        <el-option value="ProcedureTime" label="手術時間" />
        <el-option value="TypeOfProcedure" label="カテゴリ" />
        <el-option value="Age" label="年齢" />
      </el-select>

      <el-switch
        v-model="SortOrder"
        active-text="昇順"
        active-value="1"
        active-color="#444444"
        inactive-text="降順"
        inactive-value="-1"
        inactive-color="#444444" />

      <div class="menu-title">フィルタ</div>
      <el-select v-model="FilterItems" multiple clearable placeholder="全て表示する">
        <el-option-group label="カテゴリ">
          <el-option :value="{ field: 'TypeOfProcedure', value: '腹腔鏡' }" label="腹腔鏡" />
          <el-option :value="{ field: 'TypeOfProcedure', value: '腹腔鏡悪性' }" label="腹腔鏡悪性" />
          <el-option :value="{ field: 'TypeOfProcedure', value: 'ロボット' }" label="ロボット" />
          <el-option :value="{ field: 'TypeOfProcedure', value: 'ロボット悪性' }" label="ロボット悪性" />
          <el-option :value="{ field: 'TypeOfProcedure', value: '子宮鏡' }" label="子宮鏡" />
          <el-option :value="{ field: 'TypeOfProcedure', value: '卵管鏡' }" label="卵管鏡" />
        </el-option-group>
        <el-option-group label="情報">
          <el-option :value="{ field: 'PresentAE', value: true }" label="合併症あり" />
          <el-option :value="{ field: 'Notification', value: true }" label="警告あり" />
        </el-option-group>
      </el-select>
      <div>
        <el-button type="primary" @click="closeMenu">キャンセル</el-button>
        <el-button type="primary" @click="Apply">適応</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ViewListSort',
  data () {
    return ({
      SortItem: 'SequentialId',
      SortOrder: '1',
      FilterItems: []
    })
  },
  computed: {
    SortOrders () {
      return { [this.SortItem]: Number(this.SortOrder) }
    },
    Filters () {
      const filterObj = {}
      for (const item of this.FilterItems) {
        console.log(item)
        if (filterObj[item.field] === undefined) {
          filterObj[item.field] = item.value
        } else {
          if (filterObj[item.field].$in) {
            filterObj[item.field].$in.push(item.value)
          } else {
            filterObj[item.field] = { $in: [filterObj[item.field], item.value] }
          }
        }
      }
      return filterObj
    }
  },
  methods: {
    Apply () {
      this.$store.commit('SetSortOrders', this.SortOrders)
      this.$store.commit('SetFilters', this.Filters)
      this.$store.dispatch('ReloadDatastore')

      this.closeMenu()
    },
    closeMenu () {
      this.$router.push({ name: 'list' })
    }
  }
}
</script>

<style lang="sass">
div#sort-overlay
  z-index: 90
  position: absolute
  top: 32px
  left: 0
  bottom: 0
  right: 0
  opacity: 1
div#sort-menu
  z-index: 99
  position: absolute
  top: 32px
  left: 100px
  box-sizing: border-box
  width: 300px
  min-height: 200px
  background: #dbdbdb
  opacity: 1
  border: 1px solid black
  border-top-color: #dbdbdb
  padding: 5px 1rem
  display: flex
  flex-direction: column
  & > div
    margin-bottom: 0.35rem

.menu-title
  font-size: 1.1rem
  font-weight: 400
  margin-top: 0.15rem
</style>

<template>
  <div class="menu-item">
    <!-- <div class="menu-item-title">ソート</div> -->
    <div class="menu-item-content">
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
    </div>
    <div class="menu-item-bottom">
      <el-button type="primary" @click="Apply()">設定</el-button>
      <el-button type="success"  @click="Revert()">初期設定に戻す</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SortMenu',
  data () {
    return ({
      SortItem: 'SequentialId',
      SortOrder: '1'
    })
  },
  computed: {
    SortOrders () {
      return { [this.SortItem]: Number(this.SortOrder) }
    }
  },
  methods: {
    Apply () {
      this.$store.commit('SetSortOrders', this.SortOrders)
      this.$store.dispatch('ReloadDatastore')
    },
    Revert () {
      this.SortItem = 'SequentialId'
      this.SortOrder = '1'
      this.Apply()
    }
  }
}
</script>

<style lang="sass">

</style>

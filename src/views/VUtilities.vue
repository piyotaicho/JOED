<template>
  <div>
    <el-tabs v-model="SelectedTab">
      <el-tab-pane name="list">
        <span slot="label"><i class="el-icon-d-arrow-left" /> 戻る</span>
      </el-tab-pane>
      <el-tab-pane v-for="(item, name, index) in Tabs" :key="index" :label="name" :name="item"/>
    </el-tabs>
    <router-view>
    </router-view>
  </div>
</template>

<script>
export default {
  name: 'ViewUtilities',
  data () {
    return ({
      Tabs: {
        データ出力: 'export',
        データ読み込み: 'import',
        JOED5について: 'about'
      },
      SelectedTabName: 'export'
    })
  },
  computed: {
    SelectedTab: {
      get () {
        return this.SelectedTabName
      },
      set (value) {
        this.SelectedTabName = value
        this.$router.push({ name: value })
      }
    }
  },
  methods: {
    goBack () {
      this.$router.push({ name: 'list' })
    }
  }
}
</script>

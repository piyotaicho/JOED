<template>
  <div>
    <el-tabs v-model="SelectedTab" tab-position="left">
      <el-tab-pane name="list">
        <span slot="label"><i class="el-icon-d-arrow-left" /> 戻る</span>
      </el-tab-pane>
      <el-tab-pane label="データ出力" name="export">
        <Export/>
      </el-tab-pane>
      <el-tab-pane label="データ読み込み" name="import">
        <Import/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
const Export = () => import('@/components/Export')
const Import = () => import('@/components/Import')

export default {
  name: 'ViewUtilities',
  components: {
    Export, Import
  },
  data () {
    return ({
      SelectedTabName: ''
    })
  },
  created () {
    this.SelectedTabName = this.$route.name
  },
  beforeRouteUpdate (to, from, next) {
    console.log('DUDE', from.name, to.name)
    if (to.name !== from.name) {
      this.SelectedTabName = to.name
      next()
    }
  },
  computed: {
    SelectedTab: {
      get () {
        return this.SelectedTabName
      },
      set (value) {
        this.SelectedTabName = value
        this.$router.push({ name: value }).catch(_ => {})
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

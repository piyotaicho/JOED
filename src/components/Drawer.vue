<template>
  <div class="drawer-content">
    <!-- <div class="drawer-alignright"><i class="el-icon-close" @click="CloseDrawer"></i></div> -->
    <Dashboard @close="CloseDrawer"></Dashboard>
    <el-collapse accordion @change="AccordionChanged" :value="initialView">
      <el-collapse-item title="表示の設定" name="view">
        <DisplaySetting @changed="UpdateView"></DisplaySetting>
      </el-collapse-item>
      <el-collapse-item title="検索" name="search">
        <template #title>検索 <i class="el-icon-success" style="color: var(--color-success); margin-left: 1rem;" v-if="SearchActivated"/></template>
        <Search @changed="UpdateView"></Search>
      </el-collapse-item>
      <template v-if="WebApp">
        <el-collapse-item title="データの処理" name="management">
        </el-collapse-item>
        <el-collapse-item title="環境設定" name="settings">
        </el-collapse-item>
      </template>
    </el-collapse>
  </div>
</template>

<script>
import Dashboard from '@/components/Dashboard'
import DisplaySetting from '@/components/DisplaySetting'
import Search from '@/components/Search'

export default {
  name: 'Drawer',
  components: {
    Dashboard, DisplaySetting, Search
  },
  data () {
    return ({
      initialView: 'view'
    })
  },
  created () {
    this.initialView = this.SearchActivated ? 'search' : 'view'
  },
  computed: {
    WebApp () {
      return process.env.VUE_APP_MODE !== 'electron'
    },
    SearchActivated () {
      return this.$store.getters.SearchActivated
    }
  },
  methods: {
    CloseDrawer () {
      this.$emit('close')
    },
    AccordionChanged (itemname) {
      if (itemname === 'management') {
        this.$router.push({ name: 'export' })
      }
      if (itemname === 'settings') {
        this.$router.push({ name: 'settings' })
      }
    },
    UpdateView (payload) {
      this.$store.dispatch('ReloadDocumentList').then(_ => {
        this.$emit('changed')
        this.$notify({
          title: '表示条件が変更されました',
          message: this.$store.getters.NumberOfCases > 0
            ? this.$store.getters.NumberOfCases + '件表示します.'
            : '表示する症例がありません.',
          duration: 2500
        })
      })
    }
  }
}
</script>

<style lang="sass">
// override element's styles
.el-collapse-item__header
  padding: 0 0 0 2rem
  font-size: 1.15rem !important
.el-collapse-item__content
  padding: 0 2rem
  font-size: 1rem !important

.drawer-alignright
  font-size: 1.2rem
  padding-right: 0.5rem
  text-align: right

div.menu-item
  font-size: 1rem

div.menu-item-content
  & > div
    min-height: 2.6rem
    line-height: 2rem
  select
    width: 100%
    margin: 0.3rem 0
    height: 2rem
  input[type="text"]
    width: 100%
    height: 2rem
  label
    display: inline-block
    margin-left: 0.8rem

div.menu-item-bottom
  margin: 1rem 0
  text-align: right

#display-item-selection
  height: 11rem
  overflow-y: scroll
  border: 2px solid var(--border-color-base)
</style>

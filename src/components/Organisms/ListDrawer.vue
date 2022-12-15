<template>
  <el-drawer
    size="26rem"
    direction="ltr"
    :with-header="false"
    :visible="visible"
    :destroy-on-close="true"
    @open="DrawerOpened"
    @close="CloseDrawer">
    <div class="drawer-content" @keydown.ctrl.w.capture="CloseDrawer()">
      <ListDashboard @close="CloseDrawer"/>

      <el-collapse accordion @change="CollapseChanged" :value="view">
        <el-collapse-item title="表示の設定" name="view">
          <FilterAndSort @changed="UpdateView"/>
        </el-collapse-item>

        <el-collapse-item name="search">
          <template #title>
            検索 <i class="el-icon-success" style="color: var(--color-success); margin-left: 1rem;" v-if="searchActivated"/>
          </template>
          <ListSearch @changed="UpdateView"/>
        </el-collapse-item>

        <el-collapse-item title="データの処理" name="management" v-if="webApp"/>

        <el-collapse-item title="環境設定" name="settings" v-if="webApp"/>
      </el-collapse>
    </div>
  </el-drawer>
</template>

<script>
import ListDashboard from '@/components/Molecules/Dashboard'
import FilterAndSort from '@/components/Organisms/ListDrawerFilterAndSort'
import ListSearch from '@/components/Organisms/ListDrawerSearch'

export default {
  name: 'ListDrawer',
  components: {
    ListDashboard, FilterAndSort, ListSearch
  },
  props: {
    visible: {
      type: Boolean
    }
  },
  data () {
    return ({
      view: 'view',
      webApp: !process.env.VUE_APP_ELECTRON
    })
  },
  computed: {
    searchActivated () {
      return this.$store.getters.SearchActivated
    }
  },
  methods: {
    DrawerOpened () {
      this.view = this.searchActivated ? 'search' : this.view
    },
    CloseDrawer () {
      this.$emit('close')
    },
    CollapseChanged (itemname) {
      this.view = itemname
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
            : '表示する症例はありません.',
          duration: 2000
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

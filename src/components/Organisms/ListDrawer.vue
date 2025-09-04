<script setup>
import { ref, computed } from 'vue'
import { useStore } from '@/store'
import { useRouter } from 'vue-router'
import { CircleCheckFilled } from '@element-plus/icons-vue'
import ListDashboard from '@/components/Molecules/Dashboard.vue'
import FilterAndSort from '@/components/Organisms/ListDrawerFilterAndSort.vue'
import ListSearch from '@/components/Organisms/ListDrawerSearch.vue'
import { ElNotification as Notification } from 'element-plus'

const store = useStore()
const router = useRouter()

const props = defineProps({
  visible: {
    type: Boolean
  }
})

const emit = defineEmits(['close', 'changed'])
// non-reactive value
const webApp = !process.env.VITE_APP_ELECTRON
const collapseNames = ['view', 'search',
  ...(webApp ? ['management', 'settings'] : [])] // 'view'|'search'|'management'|'settings'

const view = ref('view')

const searchActivated = computed(() => store.getters.SearchActivated)

const DrawerOpened = () => {
  view.value = searchActivated.value ? 'search' : view.value
}

const CloseDrawer = () => emit('close')

const CollapseChanged = (itemname) => {
  if (collapseNames.indexOf(itemname) > -1) {
    view.value = itemname

    if (itemname === 'management') {
      router.push({ name: 'export' })
    }
    if (itemname === 'settings') {
      router.push({ name: 'settings' })
    }
  }
}

const UpdateView = () => {
  store.dispatch('ReloadDocumentList').then(_ => {
    emit('changed')

    Notification({
      title: '表示条件が変更されました',
      message: store.getters.NumberOfCases > 0
        ? store.getters.NumberOfCases + '件表示します.'
        : '表示する症例はありません.',
      duration: 2000
    })
  })
}
</script>

<template>
  <el-drawer
    size="26rem"
    direction="ltr"
    :with-header="false"
    :visible="props.visible"
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
            検索 <CircleCheckFilled style="color: var(--color-success); margin-left: 1rem;" v-if="searchActivated"/>
          </template>
          <ListSearch @changed="UpdateView"/>
        </el-collapse-item>

        <el-collapse-item title="データの処理" name="management" v-if="webApp"/>
        <el-collapse-item title="環境設定" name="settings" v-if="webApp"/>
      </el-collapse>
    </div>
  </el-drawer>
</template>

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

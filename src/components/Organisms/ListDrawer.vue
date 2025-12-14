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
const webApp = !import.meta.env.VITE_APP_ELECTRON
const collapseNames = ['view', 'search',
  ...(webApp ? ['management', 'settings'] : [])] // 'view'|'search'|'management'|'settings'

const view = ref('view')

const isViewSettingsChanged = computed(() => store.getters.ViewSettingsChanged)
const searchActivated = computed(() => store.getters.SearchActivated)

const DrawerOpened = () => {
  view.value = searchActivated.value ? 'search' : view.value
}

const CloseDrawer = () => emit('close')

const CollapseChanged = (itemname) => {
  if (collapseNames.includes(itemname)) {
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
  store.dispatch('ReloadDocumentList').then(() => {
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
    :model-value="props.visible"
    :destroy-on-close="false"
    @open="DrawerOpened"
    @close="CloseDrawer"
    >
    <div class="drawer-content" @keydown.ctrl.w.capture="CloseDrawer()">
      <ListDashboard @close="CloseDrawer"/>

      <el-collapse accordion @change="CollapseChanged" :model-value="view">
        <el-collapse-item name="view">
          <template #title>
            表示の設定 <el-icon style="color: var(--color-success); margin-left: 1rem;" v-if="isViewSettingsChanged"><CircleCheckFilled/></el-icon>
          </template>
          <FilterAndSort @changed="UpdateView"/>
        </el-collapse-item>

        <el-collapse-item name="search">
          <template #title>
            検索 <el-icon style="color: var(--color-success); margin-left: 1rem;" v-if="searchActivated"><CircleCheckFilled/></el-icon>
          </template>
          <ListSearch @changed="UpdateView"/>
        </el-collapse-item>

        <template v-if="webApp">
          <el-collapse-item title="データの処理" name="management"/>
          <el-collapse-item title="環境設定" name="settings"/>
        </template>
      </el-collapse>
    </div>
  </el-drawer>
</template>

<style lang="sass">
// override element's styles
.el-collapse-item__header
  font-size: 1.15rem !important
  span
    padding: 0 0 0 1.5rem
.el-collapse-item__content
  padding: 0 2rem
  font-size: 1rem !important
.el-collapse-icon-position-right .el-collapse-item__header
  padding-right: 0 !important

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
  input[type="text"],[type="search"]
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

div:has(.drawer-content)
  padding: 0
</style>

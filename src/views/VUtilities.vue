<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute, onBeforeRouteUpdate } from 'vue-router'
import { useStore } from '@/store'
import ExportData from '@/components/Export'
import ImportData from '@/components/Import'

const store = useStore()
const router = useRouter()
const route = useRoute()

const selectedTabName = ref(route.name || '')

onMounted(() => document.addEventListener('keydown', keyEventLister, true))
onBeforeUnmount(() => document.removeEventListener('keydown', keyEventLister, true))
onBeforeRouteUpdate((to, from, next) => {
  if (to.name !== from.name) {
    selectedTabName.value = to.name
    next()
  }
})

const selectedTab = computed({
  get: () => selectedTabName.value,
  set: (newRouteName) => {
    router.push({ name: newRouteName })
      .then(_ => { selectedTabName.value = newRouteName })
      .catch(_ => {})
  }
})

function keyEventLister (event) {
  if (store.getters['system/Platform'] === 'darwin'
    ? (event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) // macOS - command
    : (event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) // Windows - Ctrl
  ) {
    if (event.code === 'KeyU') {
      goBack()
    }
  }
}

function goBack () {
  router.push({ name: 'list' })
}
</script>

<template>
  <div>
    <el-tabs v-model="selectedTab" tab-position="left">
      <el-tab-pane name="list">
        <template v-slot:label>
          <span><i class="el-icon-d-arrow-left" /> 戻る</span>
        </template>
      </el-tab-pane>
      <el-tab-pane label="データ出力" name="export">
        <ExportData/>
      </el-tab-pane>
      <el-tab-pane label="データ読み込み" name="import">
        <ImportData/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

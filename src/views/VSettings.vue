<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useStore } from '@/store'
import { useRouter } from 'vue-router'
import { DArrowLeft } from '@element-plus/icons-vue'
import SettingOfInstutute from '@/components/SettingOfInstitute.vue'
import SettingOfAuthentication from '@/components/SettingOfAuthentication.vue'
import SettingOfView from '@/components/SettingOfView.vue'
import ShowAbout from '@/components/About.vue'

const store = useStore()
const router = useRouter()

const selectedTab = ref('institute')

onMounted(() => document.addEventListener('keydown', keyEventLister, true))
onBeforeUnmount(() => document.removeEventListener('keydown', keyEventLister, true))

const keyEventLister = (event) => {
  if (store.getters['system/Platform'] === 'darwin'
    ? (event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) // macOS - command
    : (event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) // Windows - Ctrl
  ) {
    if (event.code === 'KeyU') {
      TabClick({ index: 0 })
    }
  }
}

const TabClick = (tab) => {
  if (Number(tab.index) === 0) {
    router.push({ name: 'list' })
  }
}
</script>

<template>
  <div>
    <el-tabs v-model="selectedTab" tab-position="left" @tab-click="TabClick">
      <el-tab-pane name="list">
        <template v-slot:label>
          <DArrowLeft style="height: 1.4rem; padding-right: 0.6rem;"/> <span>戻る</span>
        </template>
      </el-tab-pane>
      <el-tab-pane label="施設情報の設定" name="institute">
        <SettingOfInstutute/>
      </el-tab-pane>
      <el-tab-pane label="パスワード認証の設定" name="authentication">
        <SettingOfAuthentication/>
      </el-tab-pane>
      <el-tab-pane label="表示・入力の設定" name="view">
        <SettingOfView/>
      </el-tab-pane>
      <el-tab-pane label="ライセンス表記" name="about">
        <ShowAbout/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

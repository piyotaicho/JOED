<script setup>
import { computed } from 'vue'
import { useStore } from '@/store'
import { useRoute, useRouter } from 'vue-router'

const store = useStore()
const route = useRoute()
const router = useRouter()

// 設定とデータリストを取得
store.dispatch('system/LoadPreferences')
  .then(() => {
    // システムSALTが未設定の場合は起動時をSALTにする.
    if (!store.getters['system/SALT']) {
      store.commit('system/SetPreferences', { Salt: Date.now() })
      return store.dispatch('system/SavePreferences')
    }
  })
  .then(() => store.dispatch('ReloadDocumentList'))

// ルーティングの設定
// electron環境下でのメインプロセスからのメッセージ(メニュー操作によるrouter変更)を処理
if (window?.API) {
  window.API.onChangeRouter((_undefined, routename) => {
    switch (route.name) {
      case 'list':
        if (routename === 'new') {
          router.push({ name: 'edit', params: { uid: 0 } })
        } else {
          if (routename !== '') {
            router.push({ name: routename })
          }
        }
        break
      case 'export':
      case 'import':
      case 'settings':
        if (routename !== '' && routename !== 'new' && route.name !== routename) {
          router.push({ name: routename })
        }
        break
    }
  })
}

// 同一uidからのroutingに対するquick-hack どんな環境でも動作する
const routeKey = computed(() => {
  const path = route.path.split('/')
  return (path.length > 2 && /^\d+$/.test(path[2]))
    ? path[1] + '/' + path[2]
    : (path[1] || '/')
})
</script>

<template>
  <div id="app">
    <router-view :key="routeKey"></router-view>
  </div>
</template>

<template>
  <div id="app">
    <router-view :key="routeKey"></router-view>
  </div>
</template>

<script>
export default {
  created () {
    this.$store.commit('initDatabase')
    this.$store.dispatch('ReloadDocumentList')
    this.$store.dispatch('system/LoadPreferences')

    // electron環境下でのメインプロセスからのメッセージ(メニュー操作)を処理
    try {
      if (process.env.VUE_APP_MODE === 'electron') {
        const { ipcRenderer } = require('electron')

        ipcRenderer.on('RendererRoute', (event, payload) => {
          if (payload) {
            const routename = payload.Name
            if (this.$route.name === 'list') {
              // 基本的にメニュー操作は症例リストでのみ有効
              if (routename === 'new') {
                this.$router.push({ name: 'new', params: { uid: 0 } })
              } else {
                this.$router.push({ name: routename })
              }
            }
          }
        })
      }
    } catch (error) {
      console.log(error)
    }
  },
  computed: {
    routeKey () {
      // 同一uidからのroutingに対するquick-hack どんな環境でも動作する
      const path = this.$route.path.split('/')
      return (path.length > 2 && path[2].match(/^\d+$/))
        ? path[1] + '/' + path[2]
        : (path[1] || '/')
    }
  }
}
</script>

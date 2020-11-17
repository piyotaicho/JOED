<template>
  <div id="app">
    <router-view :key="routeKey"></router-view>
  </div>
</template>

<script>
export default {
  created () {
    this.$store.commit('initDatabase')
    this.$store.dispatch('system/LoadPreferences').then(_ => {
      // システムSALTが未設定の場合は起動時をSALTにする.
      if (!this.$store.getters['system/SALT']) {
        this.$store.commit('system/SetPreferences', { Salt: Date.now() })
        this.$store.dispatch('system/SavePreferences')
      }
      this.$store.dispatch('ReloadDocumentList')
    })

    // electron環境下でのメインプロセスからのメッセージ(メニュー操作)を処理
    try {
      if (process.env.VUE_APP_ELECTRON) {
        const { ipcRenderer } = require('electron')

        ipcRenderer.on('RendererRoute', (event, payload) => {
          if (payload) {
            const routename = payload.Name
            switch (this.$route.name) {
              case 'list':
                if (routename === 'new') {
                  this.$router.push({ name: 'edit', params: { uid: 0 } })
                } else {
                  this.$router.push({ name: routename })
                }
                break
              case 'export':
              case 'import':
              case 'settings':
                if (routename !== 'new' && this.$route.name !== routename) {
                  this.$router.push({ name: routename })
                }
                break
            }
          }
        })
      }
    } catch (_) {
    }
  },
  computed: {
    routeKey () {
      // 同一uidからのroutingに対するquick-hack どんな環境でも動作する
      const path = this.$route.path.split('/')
      return (path.length > 2 && /^\d+$/.test(path[2]))
        ? path[1] + '/' + path[2]
        : (path[1] || '/')
    }
  }
}
</script>

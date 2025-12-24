<script setup>
const props = defineProps({
  url: {
    type: String,
    required: true
  }
})

// Electron環境かどうかViteのdefineで埋め込みを判定
const isElectron = __APP_ELECTRON__ === 'true'

const followUrl = () => {
  // webpackのコンパイルで条件分岐
  if (isElectron) {
    // RPC経由でメインプロセスにURLオープンを依頼
    window.API.OpenURL(props.url)
  } else {
    // 通常のブラウザ環境ではwindow.openで新規タブを開く
    window.open(props.url, '_blank')
  }
}
</script>

<template>
  <span class="extlink" @click="followUrl" style="text-decoration: underline;">
    <slot>{{props.url}}</slot>
  </span>
</template>

<style lang="sass">
span.extlink
  cursor: pointer
</style>

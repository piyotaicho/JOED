<script setup>
const props = defineProps({
  url: {
    type: String,
    required: true
  }
})

const followUrl = () => {
  // webpackのコンパイルで条件分岐
  if (process.env.VITE_APP_ELECTRON) {
    window.API.OpenURL(props.url)
  } else {
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

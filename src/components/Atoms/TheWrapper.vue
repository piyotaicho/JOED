<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'

document.getElementsByTagName('html')[0].style.overflowY = 'hidden'

const props = defineProps({
  alpha: {
    type: [String, Number],
    validator (val) {
      return val >= 0 && val <= 100
    },
    default: 0
  },
  preventClose: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['click'])

const wrapper = ref()

onMounted(() => {
  // TheWrapper コンポーネントの内部以外のコントロールへの tabIndex を抑止する.
  const myelements = Array.prototype.filter.call(
    wrapper.value.getElementsByTagName('*'),
    element => element.tabIndex === 0
  )
  // アプリケーションがdiv#appにマウントされていることが必須
  const rootElement = document.getElementById('app')

  if (myelements.length > 0) {
    const documentelements = Array.prototype.filter.call(
      rootElement.getElementsByTagName('*'),
      element => element.tabIndex === 0
    )
    documentelements.forEach(element => {
      if (Array.prototype.indexOf.call(myelements, element) === -1) {
        element.tabIndex = -2
      }
    })
  } else {
    // TheWrapper コンポーネントが空っぽの場合はドキュメントの tabIndex を全部抑止
    Array.prototype.filter.call(
      rootElement.getElementsByTagName('*'),
      element => element.tabIndex === 0
    )
      .forEach(element => { element.tabIndex = -2 })
  }

  // beforeUnloadの抑止をつける
  if (props.preventClose) {
    window.addEventListener('beforeunload', beforUnloadListener)
  }
})

onBeforeUnmount(() => {
  document.getElementsByTagName('html')[0].style.overflowY = 'auto'

  // beforeUnloadの抑止を終了
  if (props.preventClose) {
    window.removeEventListener('beforeunload', beforUnloadListener)
  }
  // tabIndex の復帰
  Array.prototype.filter.call(
    document.getElementsByTagName('*'),
    element => element.tabIndex === -2
  )
    .forEach(element => { element.tabIndex = 0 })
})

const wrapperStyle = computed(() => { return { 'background-color': 'rgba(0,0,0,' + props.alpha / 100 + ')' } })

const beforUnloadListener = (event) => {
  event.preventDefault()
  event.returnValue = ''
  return false
}
function click () {
  emit('click')
}
</script>

<template>
  <div class="thewrapper" :style="wrapperStyle" @click="click" ref="wrapper">
  <slot></slot>
  </div>
</template>

<style lang="sass">
div.thewrapper
  position: fixed
  z-index: +10
  left: 0
  top: 0
  width: 100%
  height: 100%
  overflow: auto
</style>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

const props = defineProps({
  alpha: {
    type: [String, Number],
    validator(val) {
      const num = Number(val)
      if (isNaN(num)) return false
      return num >= 0 && num <= 100
    },
    default: 0,
  },
  preventClose: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['click'])

const wrapper = ref()

onMounted(() => {
  // スクロールバーを消す
  document.getElementsByTagName('html')[0].style.overflowY = 'hidden'

  // Alphaの設定
  if (props.alpha >= 0) {
    wrapper.value.style.background = 'rgb(0 0 0 /' + String(Number(props.alpha) / 100) + ')'
  } else {
    wrapper.value.style.background = 'transparent'
  }

  // rootElementはドキュメントコレクションでArrayではないので、Array.prototypeで操作する
  const rootElement = document.getElementById('app')
  const myelements = Array.prototype.filter.call(
    wrapper.value.getElementsByTagName('*'),
    element => element.tabIndex === 0
  )
  if (myelements.length > 0) {
    // TheWrapper コンポーネントの内部以外のコントロールへの tabIndex を抑止する.
    const documentelements = Array.prototype.filter.call(
      rootElement.getElementsByTagName('*'),
      element => element.tabIndex === 0
    )
    documentelements.forEach(element => {
      if (!Array.prototype.includes.call(myelements, element)) {
        element.tabIndex = -2
      }
    })
  } else {
    // TheWrapper コンポーネントが空っぽの場合はドキュメントの tabIndex を全部抑止
    Array.prototype.filter.call(
      rootElement.getElementsByTagName('*'),
      element => element.tabIndex === 0
    )
  }

  // beforeUnloadの抑止をつける
  if (props.preventClose) {
    window.addEventListener('beforeunload', beforUnloadListener)
  }
})

onBeforeUnmount(() => {
  // スクロールバーを戻す
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

// beforeUnloadの抑止用イベントリスナー
const beforUnloadListener = (event) => {
  event.preventDefault()
  event.returnValue = ''
  return false
}

// Slot外のクリックイベント
function click() {
  emit('click')
}
</script>

<template>
  <div class="modalwrapper" @click="click" ref="wrapper">
    <slot></slot>
  </div>
</template>

<style lang="sass">
div.modalwrapper
  border: none
  padding: 0
  margin: 0
  position: fixed
  left: 0
  top: 0
  width: 100%
  height: 100%
  z-index: +10
  overflow: auto
</style>

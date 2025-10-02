<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

document.getElementsByTagName('html')[0].style.overflowY = 'hidden'

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
  // Alphaの設定
  if (props.alpha >= 0) {
    wrapper.value.style.background = 'rgb(0 0 0 /' + String(Number(props.alpha) / 100) + ')'
  } else {
    wrapper.value.style.background = 'transparent'
  }

  wrapper.value.showModal()

  // beforeUnloadの抑止をつける
  if (props.preventClose) {
    window.addEventListener('beforeunload', beforUnloadListener)
  }
})

onBeforeUnmount(() => {
  // beforeUnloadの抑止を終了
  if (props.preventClose) {
    window.removeEventListener('beforeunload', beforUnloadListener)
  }

  wrapper.value.close()
})

// beforeUnloadの抑止用イベントリスナー
const beforUnloadListener = (event) => {
  event.preventDefault()
  event.returnValue = ''
  return false
}

// コンテンツ外のクリックイベント
function click() {
  emit('click')
}
</script>

<template>
  <dialog class="modalwrapper" @click="click" ref="wrapper">
    <slot></slot>
  </dialog>
</template>

<style lang="sass">
dialog.modalwrapper
  border: none
  padding: 0
  margin: 0
  position: fixed
  left: 0
  top: 0
  width: 100%
  height: 100%

dialog.modalwrapper::backdrop
  background: transparent
</style>

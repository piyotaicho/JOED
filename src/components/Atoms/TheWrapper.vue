<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

const props = defineProps({
  alpha: {
    type: [String, Number],
    validator(val: string | number) {
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
const emit = defineEmits<{
  (e: 'click'): void
}>()

const wrapper = ref<HTMLElement | null>(null)

onMounted(() => {
  // スクロールバーを消す
  const htmlElement = document.getElementsByTagName('html')[0]
  if (htmlElement) {
    htmlElement.style.overflowY = 'hidden'
  }

  // Alphaの設定
  const alphaValue = Number(props.alpha)
  if (wrapper.value && alphaValue >= 0) {
    wrapper.value.style.background = 'rgb(0 0 0 /' + String(alphaValue / 100) + ')'
  } else {
    if (wrapper.value) {
      wrapper.value.style.background = 'transparent'
    }
  }

  // rootElementはドキュメントコレクションでArrayではないので、Array.prototypeで操作する
  const rootElement = document.getElementById('app')
  if (!rootElement || !wrapper.value) {
    return
  }

  const myelements = Array.from(wrapper.value.getElementsByTagName('*')) as HTMLElement[]
  const focusableInWrapper = myelements.filter(
    (element) => element.tabIndex === 0
  )
  if (focusableInWrapper.length > 0) {
    // TheWrapper コンポーネントの内部以外のコントロールへの tabIndex を抑止する.
    const documentelements = (Array.from(rootElement.getElementsByTagName('*')) as HTMLElement[]).filter(
      (element) => element.tabIndex === 0
    )
    documentelements.forEach((element) => {
      if (!focusableInWrapper.includes(element)) {
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
    window.addEventListener('beforeunload', beforeUnloadListener)
  }
})

onBeforeUnmount(() => {
  // スクロールバーを戻す
  const htmlElement = document.getElementsByTagName('html')[0]
  if (htmlElement) {
    htmlElement.style.overflowY = 'auto'
  }

  // beforeUnloadの抑止を終了
  if (props.preventClose) {
    window.removeEventListener('beforeunload', beforeUnloadListener)
  }

  // tabIndex の復帰
  (Array.from(document.getElementsByTagName('*')) as HTMLElement[])
    .filter((element) => element.tabIndex === -2)
    .forEach((element) => { element.tabIndex = 0 })
})

// beforeUnloadの抑止用イベントリスナー
const beforeUnloadListener = (event: BeforeUnloadEvent): false => {
  event.preventDefault()
  event.returnValue = ''
  return false
}

// Slot外のクリックイベント
function click(): void {
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

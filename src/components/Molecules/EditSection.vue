<script setup>
// 編集セクションの登録・取り消しボタン部分(とキーボードショートカット)の大きな雛型 slotに内容を
import { onMounted, onBeforeUnmount } from 'vue'
import { useStore } from '@/store'

const store = useStore()
const emit = defineEmits(['commit', 'discard'])

onMounted(() => document.addEventListener('keydown', KeyboardEventhandler, true))
onBeforeUnmount(() => document.removeEventListener('keydown', KeyboardEventhandler, true))

function KeyboardEventhandler (event) {
  if (event.repeat) return

  const platform = store.getters['system/Platform']

  if (platform === 'darwin'
    ? (event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) // macOS - command
    : (event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) // Windows - Ctrl
  ) {
    switch (event.code) {
      case 'KeyU':
        emitDiscard()
        break
      case 'Enter':
        event.preventDefault()
        emitCommit()
        break
    }
  }
}

function emitDiscard () {
  emit('discard')
}

function emitCommit () {
  emit('commit')
}
</script>

<template>
  <div class="edititem">
    <slot></slot>
    <div class="content-bottom">
      <div class="controls">
        <el-button type="primary" @click="emitDiscard">取り消し</el-button>
        <el-button type="primary" @click="emitCommit">登録</el-button>
      </div>
    </div>
  </div>
</template>

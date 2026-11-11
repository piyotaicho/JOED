<script setup lang="ts">
// 編集セクションの登録・取り消しボタン部分(とキーボードショートカット)の大きな雛型 slotに内容を
import { onMounted, onBeforeUnmount } from 'vue'
import { useStore } from '@/store'

const store = useStore()
const emit = defineEmits<{
  (e: 'commit'): void
  (e: 'discard'): void
}>()

onMounted(() => document.addEventListener('keydown', KeyboardEventhandler, true))
onBeforeUnmount(() => document.removeEventListener('keydown', KeyboardEventhandler, true))

function KeyboardEventhandler (event: KeyboardEvent) {
  if (event.repeat) return

  const platform = String(store.getters['system/Platform'] || '')

  if (platform === 'darwin'
    ? (event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) // macOS - command
    : (event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) // Windows - Ctrl
  ) {
    switch (event.code) {
      case 'KeyU':
        emit('discard')
        break
      case 'Enter':
        event.preventDefault()
        emit('commit')
        break
    }
  }
}
</script>

<template>
  <div class="edititem">
    <slot></slot>
    <div class="content-bottom">
      <div class="controls">
        <el-button type="primary" @click="emit('discard')">取り消し</el-button>
        <el-button type="primary" @click="emit('commit')">登録</el-button>
      </div>
    </div>
  </div>
</template>

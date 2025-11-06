<script setup>
import { Operation } from '@element-plus/icons-vue'
const props = defineProps({
  tabindex: {
    type: String, Number
  },
  accesskey: {
    type: String
  }
})
const emit = defineEmits(['click'])

const click = (event) => emit('click', event)

</script>

<template>
  <div class="drawer-button"
    :tabindex="props.tabindex"
    @click="click"
    @keydown.enter="click"
    :accesskey="props.accesskey"
    data-tooltip="表示設定">
    <el-icon><Operation /></el-icon>
  </div>
</template>

<style lang="sass">
div.drawer-button
  position: absolute
  cursor: pointer
  right: 5px
  bottom: 5px
  width: 30px
  height: 30px
  &:hover
    color: var(--color-text-regular)
  &:focus
    color: var(--color-text-regular)
  &::after
    content: attr(data-tooltip)
    position: absolute
    bottom: 25%
    right: 50%
    transform: translateX(50%)
    color: var(--color-text-regular)
    background-color: rgba(255,255,255,0.8)
    padding: 0
    font-size: 0.8rem
    white-space: nowrap
    opacity: 0
    pointer-events: none
    transition: opacity 0.5s 1s ease-in-out
  &:hover::after
    opacity: 1
  & > i
    width: 100%
    height: 100%
    display: block
    & svg
      width: 100%
      height: 100%
</style>

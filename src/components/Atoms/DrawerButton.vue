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
  >
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
  & > i
    width: 100%
    height: 100%
    display: block
    & svg
      width: 100%
      height: 100%
</style>

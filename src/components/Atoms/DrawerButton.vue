<script setup>
import { Menu } from '@element-plus/icons-vue'
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
  <div class="open-drawer-button"
    :tabindex="props.tabindex"
    @click="click"
    @keydown.enter="click"
    :accesskey="props.accesskey">
    <Menu />
  </div>
</template>

<style lang="sass">
div.open-drawer-button
  position: absolute
  right: 5px
  bottom: 5px
  width: 30px
  height: 30px
  &:hover
    &::after
      color: var(--color-text-regular)
  &::focus
    &::after
      color: var(--color-text-regular)
</style>

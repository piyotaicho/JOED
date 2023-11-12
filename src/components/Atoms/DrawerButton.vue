<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  tabindex: {
    type: String, Number
  },
  accesskey: {
    type: String
  }
})
const emit = defineEmits(['click'])

function click (event) {
  emit('click', event)
}
</script>

<template>
  <div class="open-drawer-button"
    :tabindex="props.tabindex"
    @click="click"
    @keydown.enter="click"
    :accesskey="props.accesskey">
  </div>
</template>

<style lang="sass">
div.open-drawer-button
  position: absolute
  right: 5px
  bottom: 5px
  width: 30px
  height: 30px
  &::after
    content: '\e798'
    color: var(--color-primary)
    font-family: 'element-icons'
    font-size: 25px
    padding-top: 6px
    padding-left: 3px
  &:hover
    &::after
      color: var(--color-text-regular)
  &::focus
    &::after
      color: var(--color-text-regular)
</style>

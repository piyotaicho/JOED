<template>
    <div class="new-entry-button"
      :tabindex="props.tabindex"
      @click="cclickButton"
      @keydown.enter="cclickButton"
      @keydown.space="cclickButton"
      :accesskey="props.accesskey">
      <Plus />
    </div>
</template>

<script setup>
import { Plus } from '@element-plus/icons-vue'

const props = defineProps({
  tabindex: {
    type: [String, Number],
    default: 0
  },
  accesskey: {
    type: String
  }
})
const emit = defineEmits(['click'])

const cclickButton = (event) => emit('click', event)
</script>

<style lang="sass">
div.new-entry-button
  position: absolute
  cursor: pointer
  right: 5px
  bottom: 5px
  width: 30px
  height: 30px
  border: 2px solid var(--color-primary)
  padding: 1px
  border-radius: 5px
  background: var(--background-color-list)
  &:hover
    border-color: var(--color-text-regular)
    &::after
      color: var(--color-text-regular)
  &:focus
    outline: none
    border: 3px solid var(--color-primary)
    padding: 0px
</style>

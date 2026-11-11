<script setup lang="ts">
import type { PropType } from 'vue'

const props = defineProps({
  tabindex: {
    type: [Number, String] as PropType<number | string | undefined>
  },
  bordered: {
    type: Boolean,
    default: false,
  }
})
const emit = defineEmits<{
  (e: 'click'): void
}>()

const click = (): void => emit('click')
</script>

<template>
  <div class="closebutton" :class="props.bordered ? 'borderedButton' : ''" @keypress.enter="click" @click="click" :tabindex="props.tabindex"></div>
</template>

<style lang="sass">
div.closebutton
  position: absolute
  right: 0.4rem
  top: 0.4rem
  width: 1rem
  height: 1rem
  box-sizing: border-box
  overflow: hidden
  &::before,&::after
    content: ''
    position: absolute
    top: 50%
    left: 50%
    width: 0.1rem
    height: 0.9rem
    background: var(--color-text-regular)
  &::before
    transform: translate(-50%, -50%) rotate(45deg)
  &::after
    transform: translate(-50%, -50%) rotate(-45deg)
  &:hover::before,&:hover::after
    width: 0.13rem
    background: var(--color-primary)
.borderedButton
  border: 1px solid var(--border-color-base)

</style>

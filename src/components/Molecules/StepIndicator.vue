<script setup>
import { defineProps, computed } from 'vue'

const props = defineProps({
  step: {
    type: Number
  },
  stepcount: {
    type: Number
  },
  icon: {
    type: String,
    default: 'StepIndicatorDot'
  },
  description: {
    type: String
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const IconStyle = computed(() => {
  const colorTable = {
    DISABLED: 'var(--color-text-placeholder)',
    YET: 'var(--color-text-regular)',
    NORMAL: 'var(--color-text-regular)',
    PROCESSING: 'var(--color-warning)',
    DONE: 'var(--color-success)'
  }

  switch (true) {
    case (props.disabled):
      return { color: colorTable.DISABLED }

    case (props.step === undefined):
      return (props.stepcount === undefined || props.stepcount === 0)
        ? { color: colorTable.NORMAL }
        : { color: colorTable.DONE }

    case (props.stepcount === undefined || props.stepcount < props.step):
      return { color: colorTable.YET }

    case (props.stepcount === props.step):
      return { color: colorTable.PROCESSING }

    default: // stepcount > step
      return { color: colorTable.DONE }
  }
})
</script>

<template>
  <div class="StepIndicator">
    <div class="StepIndicatorDescription">
      <div class="StepIndicatorIcon"><div :class="props.icon" :style="IconStyle"></div></div>
      <div class="StepIndicatorDescriptionContent"><slot name="description">{{props.description}}</slot></div>
    </div>
    <div class="StepIndicatorSlot"><slot name="default"></slot></div>
  </div>
</template>

<style lang="sass">
div.StepIndicatorDescription
  display: flex
  flex-direction: row
  height: 2.4rem

div.StepIndicatorIcon
  margin: auto 0.2rem
  font-size: 1.8rem

div.StepIndicatorDot
  &::after
    content: '\26ab'
    display: inline-block
    vertical-align: middle

div.StepIndicatorDescriptionContent
  margin: auto 0 auto 0.7rem
</style>

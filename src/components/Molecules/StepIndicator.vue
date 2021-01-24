<template>
  <div class="StepIndicator">
    <div class="StepIndicatorDescription">
      <div class="StepIndicatorIcon"><div :class="icon" :style="IconStyle"></div></div>
      <div class="StepIndicatorDescriptionContent"><slot name="description">{{description}}</slot></div>
    </div>
    <div class="StepIndicatorSlot"><slot name="default"></slot></div>
  </div>
</template>

<script>
export default {
  name: 'StepIndicator',
  props: {
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
  },
  computed: {
    IconStyle () {
      const ColorSchime = {
        DISABLED: 'var(--color-text-placeholder)',
        YET: 'var(--color-text-regular)',
        NORMAL: 'var(--color-text-regular)',
        PROCESSING: 'var(--color-warning)',
        DONE: 'var(--color-success)'
      }

      // if (this.icon === 'StepIndicatorDot') {
      //   return { background: ColorSchime[this.StepStatus] }
      // } else {
      return { color: ColorSchime[this.StepStatus] }
      // }
    },
    StepStatus () {
      if (this.disabled) {
        return 'DISABLED'
      }
      if (this.step === undefined) {
        return (this.stepcount === undefined || this.stepcount === 0)
          ? 'NORMAL'
          : 'DONE'
      }
      if (this.stepcount === undefined || this.stepcount < this.step) {
        return 'YET'
      }
      if (this.stepcount === this.step) {
        return 'PROCESSING'
      }
      // if (stepcount > step)
      return 'DONE'
    }
  }
}
</script>

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

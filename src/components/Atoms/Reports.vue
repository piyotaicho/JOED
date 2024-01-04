<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
const props = defineProps({
  report: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div class="ReportArea">
    <pre>{{props.report}}</pre>
  </div>
</template>

<style lang="sass">
div.ReportArea
  width: 50rem
  padding: 0.5rem
  border: 1px solid var(--color-primary)
  border-radius: 0.3rem
  background: var(--background-color-dialog)
  pre
    line-height: 1.8rem
    margin: 0
</style>

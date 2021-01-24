<template>
  <div class="ReportArea">
    <pre>{{report}}</pre>
  </div>
</template>

<script>
export default {
  name: 'Reports',
  props: {
    report: {
      type: String,
      default: ''
    }
  }
}
</script>

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

<template>
    <div class="section-item">
        Item description comes here. Here is {{sectionType}}.
    </div>
</template>

<script>
const SectionTypes = ['手術診断', '実施術式', '合併症']

export default {
  name: 'SectionItem',
  props: {
    uid: {
      type: Number,
      required: false,
      default: 0
    },
    sectionType: {
      type: String,
      required: true,
      validator (value) {
        return (SectionTypes.indexOf(value) !== -1)
      }
    },
    title: {
      type: String,
      required: true
    },
    additionalDescription: {
      type: String,
      required: false,
      default: ''
    }
  }
}
</script>

<style lang="sass" scoped>
div.section-item
    margin: 1px 40px
    border: #222222 1px solid
    height: 32px
    padding: 2px
    &:last-child
        margin-bottom: 20px
</style>

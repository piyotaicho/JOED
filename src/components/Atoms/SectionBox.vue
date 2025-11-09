<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div class="section">
    <div>
      <span class="section-title">{{props.title}} ： </span>
      <slot name="aftertitle"></slot>
    </div>
    <slot></slot>
  </div>
</template>

<style lang="sass">
div.section
  position: relative
  background: white
  width: 800px
  min-height: 4rem
  border: 1px solid black
  margin-top: 0.85rem
  padding-bottom: 0.35rem
  .section-title
    margin: 4px
    font-size: 1.15rem
</style>

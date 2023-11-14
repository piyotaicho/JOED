<template>
  <div class="QueryPane">
    <div class="QueryPaneTitle"><slot name="title">{{props.title}}</slot></div>
    <div class="QueryPaneList">
      <div>
        <list-item v-for="(item, index) in props.container"
          :key="index"
          :item="item"
          :erasable="props.erasable"
          :draggable="props.draggable"
          @erase="emit('erase', index)"
          @dragged="emit('dragged', index, $event)"
          @dropped="emit('dropped', index, $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import ListItem from '@/components/Molecules/QueryPaneListItem'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  draggable: {
    type: Boolean,
    default: false
  },
  erasable: {
    type: Boolean,
    default: false
  },
  container: {
    type: Array,
    require: true
  }
})

const emit = defineEmits(['erase', 'dragged', 'dropped'])
</script>

<style lang="sass">
div.QueryPane
  display: flex
  flex-direction: column
  justify-content: flex-start
  height: 50%
  margin-bottom: 1rem
div.QueryPaneTitle
  font-weight: 600
  margin: 0 1rem
  height: 1.4rem
div.QueryPaneList
  position: relative
  min-height: 190.4px
  height: 100%
  div
    position: absolute
    top: 0
    left: 0
    bottom: 0
    right: 0
    overflow-y: auto
    div
      position: relative
</style>

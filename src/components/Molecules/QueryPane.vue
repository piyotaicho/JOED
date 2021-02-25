<template>
  <div class="QueryPane">
    <div class="QueryPaneTitle"><slot name="title">{{title}}</slot></div>
    <div class="QueryPaneList">
      <div>
        <list-item v-for="(item, index) in container"
          :key="index"
          :item="item"
          :erasable="erasable"
          @erase="erase(index)"
          :draggable="draggable"
          @dragged="dragged(index, $event)"
          @dropped="dropped(index, $event)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import ListItem from '@/components/Molecules/QueryPaneListItem'

export default {
  name: 'QueryPane',
  components: {
    ListItem
  },
  props: {
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
  },
  methods: {
    erase (index) {
      this.$emit('erase', index)
    },
    dragged (index, dragevent) {
      this.$emit('dragged', index, dragevent)
    },
    dropped (index, dragevent) {
      this.$emit('dropped', index, dragevent)
    }
  }
}
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

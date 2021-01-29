<template>
  <div class="QueryPane">
    <div><slot name="title">{{title}}</slot></div>
    <div class="QueryPaneList">
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
  height: 95%
  margin: 0.5rem 0.3rem 0.5rem 0.3rem
  padding-bottom: 1rem
  display: flex
  flex-direction: column
div.QueryPaneList
  height: 11.8rem
  overflow-y: auto
  flex-grow: 1
</style>

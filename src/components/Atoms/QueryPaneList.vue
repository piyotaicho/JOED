<template>
  <div class="QueryPaneList">
    <template  v-for="(item, index) in container">
      <list-item :key="index"
        :item="item"
        :erasable="erasable" @erase-clicked="eraseClicked(index)"
        :draggable="draggable" @item-dragged="itemDragged(index, $event)" @item-dropped="itemDropped(index, $event)">
      </list-item>
    </template>
  </div>
</template>

<script>
import ListItem from '@/components/Atoms/QueryPaneListItem'

export default {
  name: 'QueryPaneList',
  components: {
    ListItem
  },
  props: {
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
  computed: {
    computedContainer: {
      get () {
        return this.Container
      },
      set (value) {

      }
    }
  },
  methods: {
    eraseClicked (index) {
      this.$emit('erase-clicked', index)
    },
    itemDragged (index, dragevent) {
      this.$emit('item-dragged', index, dragevent)
    },
    itemDropped (index, dragevent) {
      this.$emit('item-dropped', index, dragevent)
    }
  }
}
</script>

<style lang="sass">
div.QueryPaneList
  height: 11.8rem
  overflow-y: auto
  flex-grow: 1
</style>

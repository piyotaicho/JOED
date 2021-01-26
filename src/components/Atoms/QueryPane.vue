<template>
  <div class="QueryPane">
    <div><slot name="title">{{title}}</slot></div>
    <div>
      <label v-if="checkBoxTitle">
        <input type="checkbox" v-model="computedCheckBox" />
        {{checkBoxTitle}}
      </label>
    </div>
    <query-pane-list
      :container="listContainer"
      :draggable="draggable"
      :erasable="erasable"
      @erase-clicked="eraseClicked"
      @item-dragged="itemDragged"
      @item-dropped="itemDropped"
    />
  </div>
</template>

<script>
import QueryPaneList from '@/components/Atoms/QueryPaneList'

export default {
  name: 'QueryPane',
  components: {
    QueryPaneList
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
    checkBoxTitle: {
      type: String,
      default: ''
    },
    checkBoxValue: {
      type: Boolean,
      default: false
    },
    container: {
      type: Array,
      require: true
    }
  },
  computed: {
    computedCheckBox: {
      get () {
        return this.checkBoxValue
      },
      set (value) {
        this.$emit('check-box-value-changed', value)
      }
    },
    listContainer: {
      get () {
        return this.container
      },
      set (value) {
        this.$emit('container-changed', value)
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
div.QueryPane
  height: 95%
  margin: 0.5rem 0.3rem 0.5rem 0.3rem
  padding-bottom: 1rem
  display: flex
  flex-direction: column
</style>

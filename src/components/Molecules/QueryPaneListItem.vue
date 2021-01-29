<template>
  <div class="QueryPaneListItem"
    :draggable="draggable"
    @dragover.prevent
    @dragenter.prevent
    @dragstart="dragged($event)"
    @drop="dropped($event)"
  >
    <div class="QueryPaneListItemLabel">
      <slot name="default">
        <div class="QueryPaneListItemLabelContents">
          <div v-for="(item, index) of labels" :key="index">{{item}}</div>
        </div>
      </slot>
    </div>
    <div class="QueryPaneListItemEraseButton" v-if="erasable" @click="erase" />
  </div>
</template>

<script>
export default {
  name: 'QueryPaneLisyItem',
  props: {
    item: {
      type: [String, Number, Array, Object],
      default: ''
    },
    draggable: {
      type: Boolean,
      default: false
    },
    erasable: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    labels () {
      switch (typeof this.item) {
        case 'number':
        case 'string':
          return [this.item.toString()]

        case 'object':
          if (Array.isArray(this.item)) {
            return [...this.item]
          } else {
            return [Object.keys(this.item)[0], this.item[Object.keys(this.item)[0]]]
          }

        default:
          return ['']
      }
    }
  },
  methods: {
    erase () {
      this.$emit('erase')
    },
    dummyEventHandler () {
    },
    dragged (event) {
      this.$emit('dragged', event)
    },
    dropped (event) {
      this.$emit('dropped', event)
    }
  }
}
</script>

<style lang="sass">
div.QueryPaneListItem
  display: flex
  flex-direction: row
  justify-content: space-between
  background: white
  height: 2rem
  border: 1px solid grey
  border-radius: 0.18rem
  margin: 0.2rem
  &:nth-child(odd)
    background: var(--background-color-list)
  &:nth-child(even)
    background: var(--background-color-dialog)

div.QueryPaneListItemLabel
  width: 100%
  margin: auto 0.4rem
  text-align: left
  white-space: nowrap
  overflow-x: hidden
  text-overflow: ellipsis
div.QueryPaneListItemLabelContents
  display: flex
  flex-direction: row
  & div
    flex-grow: 1
    text-align: left
    white-space: nowrap
    overflow-x: hidden
    text-overflow: ellipsis
    &:nth-child(2)
      text-align: right
div.QueryPaneListItemEraseButton
  position: relative
  width: 0.8rem
  height: 0.8rem
  flex-grow: 0
  margin: auto 0.8rem
  padding: 0
  border: 1px solid grey
  background: white
  overflow: hidden
  &::after
    position: absolute
    top: -0.32rem
    color: grey
    font-size: 1rem
    content: '\00d7'
</style>

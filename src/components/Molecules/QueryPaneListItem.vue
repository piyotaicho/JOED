<template>
  <div class="QueryPaneListItem"
    ref="item"
    :draggable="draggable"
    @dragover.prevent="changeStyle(true)"
    @dragleave.prevent="changeStyle(false)"
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
    <div class="QueryPaneListItemEraseButton" v-if="erasable" @click="erase"/>
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
      this.changeStyle(false)
      this.$emit('dropped', event)
    },
    changeStyle (status) {
      if (status) {
        // true - dragoverの状態
        this.$refs.item.classList.add('ondrag')
      } else {
        // false - dragoverが何らかの要因(drop, leave)で解除
        this.$refs.item.classList.remove('ondrag')
      }
    }
  }
}
</script>

<style lang="sass">
div.QueryPaneListItem
  display: flex
  flex-direction: row
  justify-content: space-between
  height: 2rem
  border: 0.15rem solid var(--border-color-base)
  border-radius: 0.18rem
  margin: 0.14rem
  &:nth-child(odd)
    background: var(--background-color-list)
  &:nth-child(even)
    background: var(--background-color-dialog)
  &.ondrag
    border-color: var(--color-warning)

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
  width: 1rem
  height: 1rem
  flex-grow: 0
  margin: auto 0.8rem
  padding: 0
  border: 1px solid grey
  background: white
  overflow: hidden
  &::after
    position: absolute
    margin: auto
    color: grey
    // font-family: 'element-icons' !important
    font-size: 1rem
    // content: '\e6db'
    content: '*'
</style>

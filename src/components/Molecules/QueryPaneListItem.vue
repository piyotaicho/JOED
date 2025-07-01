<script setup>
import { ref, computed } from 'vue'
import CloseButton from '@/components/Atoms/CloseButton'

// props are NON-reactive
const props = defineProps({
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
})

const emit = defineEmits(['erase', 'dragged', 'dropped'])

const draggableItem = ref()

const labels = computed(() => {
  switch (typeof props.item) {
    case 'number':
    case 'string':
      return [props.item.toString()]

    case 'object':
      if (Array.isArray(props.item)) {
        return [...props.item]
      } else {
        const label = Object.keys(props.item)[0]
        return [label, props.item[label]]
      }

    default:
      return ['']
  }
})

const erase = () => emit('erase')

const dragged = (event) => emit('dragged', event)

const dropped = (event) => {
  changeStyle(false)
  emit('dropped', event)
}

const changeStyle = (status) => {
  if (status) {
    // true - dragoverの状態
    draggableItem.value.classList.add('ondrag')
  } else {
    // false - dragoverが何らかの要因(drop, leave)で解除
    draggableItem.value.classList.remove('ondrag')
  }
}
</script>

<template>
  <div class="QueryPaneListItem"
    ref="draggableItem"
    :draggable="props.draggable"
    @dragover.prevent="changeStyle(true)"
    @dragleave.prevent="changeStyle(false)"
    @dragenter.prevent
    @dragstart="dragged($event)"
    @drop="dropped($event)"
  >
    <div class="QueryPaneListItemLabel">
      <slot name="default">
        <div class="QueryPaneListItemLabelContents">
          <template v-for="(item, index) of labels" :key="index">
            <div>{{ item }}</div>
          </template>
        </div>
      </slot>
    </div>
    <div class="QueryPaneListItemEraseButton" v-if="props.erasable" >
      <CloseButton @click="erase" bordered></CloseButton>
    </div>
  </div>
</template>

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
  width: 1.2rem
  height: 1.2rem
  flex-grow: 0
  margin: auto 0.3rem
  background: var(--background-color-list)
  overflow: hidden
</style>

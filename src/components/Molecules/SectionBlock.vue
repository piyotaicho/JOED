<script setup>
import { computed } from 'vue'
import NewEntryButton from '@/components/Atoms/NewEntryButton'
import SectionItem from '@/components/SectionItem'
import draggableContent from 'vuedraggable'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  // Vue 3 v-model support
  modelValue: {
    type: Array, // String[]
    required: true
  },
  // Vue 2互換性のため一時的に保持
  container: {
    type: Array, // String[]
    required: false
  },
  draggable: {
    type: Boolean,
    default: true
  }
})
const emit = defineEmits(['addnewitem', 'edititem', 'removeitem', 'update:modelValue', 'update:container'])

const items = computed({
  get: () => props.modelValue || props.container,
  set: (value) => {
    emit('update:modelValue', value)
    // Vue 2互換性のため
    emit('update:container', value)
  }
})

const addNewItem = () => emit('addnewitem')

const editItem = (index, item) => emit('edititem', {
  ItemIndex: index,
  ItemValue: item
})

const removeItem = (index) => emit('removeitem', index)
</script>

<template>
  <div class="section">
    <span class="section-title">{{props.title}} ： </span>
    <slot name="beforeitemlist"></slot>
    <template v-if="draggable">
      <draggableContent handle=".handle" v-model="items">
        <div class="section-item-list"
          v-for="(item, index) in items"
          :key="index">
          <slot :item="item" :index="index">
            <SectionItem :item="item" @remove="removeItem(index)" @edit="editItem(index, item)" editable/>
          </slot>
        </div>
      </draggableContent>
    </template>
    <template v-else>
      <div class="section-item-list"
        v-for="(item, index) in items"
        :key="index">
        <slot :item="item" :index="index">
          <SectionItem :item="item" @remove="removeItem(index)" @edit="editItem(index, item)"/>
        </slot>
      </div>
    </template>
    <slot name="afteritemlist"></slot>
    <NewEntryButton @click="addNewItem()" tabindex="0" />
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

  div.section-item-list
    border: 0
    margin: 1px 8px 2px 42px
    div.section-item
      position: relative
      background: var(--color-text-placeholder)
      border-left: var(--color-text-placeholder) 0.25rem solid
      line-height: 1.5
      padding: 0.5em
      margin-right: 48px
      margin-bottom: 2px
      list-style: none
      .handle
        font-size: 1.2rem
        margin: auto 0.7rem auto 0
      .edit-button
        position: absolute
        font-size: 1.25rem
        right: 50px
        margin-top: auto
        margin-bottom: auto
        padding-top: 0.1rem
      .remove-button
        position: absolute
        font-size: 1.25rem
        right: 20px
        margin-top: auto
        margin-bottom: auto
        padding-top: 0.1rem
  div.section-item-list:first-of-type div.section-item:first-of-type
      border-left: black 0.25rem solid
</style>

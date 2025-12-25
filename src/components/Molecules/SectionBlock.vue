<script setup>
import SectionBox from '../Atoms/SectionBox.vue'
import NewEntryButton from '@/components/Atoms/NewEntryButton.vue'
import SectionItem from '@/components/Molecules/SectionItem.vue'
import draggableContent from 'vuedraggable'

// vuegraggableのUpdate = undefinedのエラーを回避
draggableContent.compatConfig = {
  MODE: 3
}

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  draggable: {
    type: Boolean,
    default: true
  }
})
const items = defineModel({ type: Array, default: [] })

const emit = defineEmits(['add', 'edit', 'remove'])

const addItem = () => emit('add')

const editItem = (index, value) => emit('edit', {index, value})

const removeItem = (index) => emit('remove', index)
</script>

<template>
  <sectionBox :title="props.title">
    <template #aftertitle><slot name="beforeitemlist"></slot></template>
    <template v-if="draggable">
      <draggableContent handle=".handle" v-model="items" item-key="index">
        <template #item="{element, index}">
          <div class="section-item-list">
            <slot :item="element" :index="index">
              <SectionItem :value="element" @remove="removeItem(index)" @edit="editItem(index, element)" editable/>
            </slot>
          </div>
        </template>
      </draggableContent>
    </template>
    <template v-else>
      <template v-for="(element, index) in items" :key="index">
        <div class="section-item-list">
          <slot :item="element" :index="index">
            <SectionItem :value="element" @remove="removeItem(index)" @edit="editItem(index, element)"/>
          </slot>
        </div>
      </template>
    </template>
    <slot name="afteritemlist"></slot>
    <NewEntryButton @click="addItem()" tabindex="0" />
  </sectionBox>
</template>

<style lang="sass">
div.section-item-list
  border: 0
  margin: 1px 8px 2px 42px
  div.section-item
    position: relative
    display: flex
    align-items: center
    background: var(--color-text-placeholder)
    border-left: var(--color-text-placeholder) 0.25rem solid
    line-height: 1.5
    padding: 0.5em
    margin-right: 48px
    margin-bottom: 2px
    list-style: none
    .handle
      font-size: 1.3rem
      margin: 0 0.7rem 0 0
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

<template>
  <div class="section">
    <span class="section-title">{{title}} ： </span>
    <slot name="beforeitemlist"></slot>
    <template v-if="draggable">
      <draggable handle=".handle" v-model="items">
        <div class="section-item-list"
          v-for="(item, index) in items"
          :key="index">
          <slot :item="item" :index="index">
            <SectionItem :item="item" @remove="RemoveItem(index)" @edit="EditItem(index, item)" editable/>
          </slot>
        </div>
      </draggable>
    </template>
    <template v-else>
      <div class="section-item-list"
        v-for="(item, index) in items"
        :key="index">
        <slot :item="item" :index="index">
          <SectionItem :item="item" @remove="RemoveItem(index)" @edit="EditItem(index, item)"/>
        </slot>
      </div>
    </template>
    <slot name="afteritemlist"></slot>
    <NewEntryButton @click="AddNewItem()" tabindex="0" />
  </div>
</template>

<script>
import NewEntryButton from '@/components/Atoms/NewEntryButton'
import draggable from 'vuedraggable'
import SectionItem from '@/components/SectionItem'

export default {
  name: 'Section',
  components: {
    draggable, SectionItem, NewEntryButton
  },
  props: {
    title: {
      type: String,
      required: true
    },
    container: {
      type: Array,
      required: true
    },
    draggable: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    items: {
      get () {
        return this.container
      },
      set (value) {
        this.$emit('update:container', value)
      }
    }
  },
  methods: {
    AddNewItem () {
      this.$emit('addnewitem')
    },
    EditItem (index, item) {
      this.$emit('edititem', {
        ItemIndex: index,
        ItemValue: item
      })
    },
    RemoveItem (index) {
      this.$emit('removeitem', index)
    }
  }
}
</script>

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
        margin-right: 0.7rem
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

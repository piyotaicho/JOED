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
            <SectionItem :item="item" @remove="RemoveItem(index)" @edit="EditItem(index, item)"/>
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

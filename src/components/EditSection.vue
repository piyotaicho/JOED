<template>
  <div class="section">
    <span class="section-title">{{sectionName}} ： </span>
    <span v-if="optionCaption">
      <label>
        <input type="checkbox" v-model="ItemOption">
        {{optionCaption}}
      </label>
    </span>
    <draggable handle=".handle" v-model="ItemContainer">
      <div class="list-item"
        v-for="(item, index) in ItemContainer"
        :key="index">
        <div class="item-description">
          <span class="handle">[ = ] </span>
          <span>
            <slot :item="item">
              <ItemLabel :Item="item"/>
            </slot>
          </span>
          <span class="edit-button" @click="RemoveItem(index)"> [REMOVE] </span>
        </div>
        <div class="item-description" v-if="item.AdditionalProcedure">
          <span class="handle">[ = ] </span>
          <span>
            <ItemLabel :Item="item.AdditionalProcedure"/>
          </span>
          <span class="edit-button" @click="RemoveItem(index)"> [REMOVE] </span>
        </div>
      </div>
    </draggable>
    <span class="new-entry-button" @click="AddNewItem()"></span>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import ItemLabel from '@/components/Atoms/AtomItemlabel'

export default {
  name: 'EditSection',
  components:
  {
    draggable, ItemLabel
  },
  props: {
    sectionName: {
      type: String,
      required: true
    },
    container: {
      type: Array,
      required: true
    },
    optionCaption: {
      type: String,
      required: false,
      default: ''
    },
    optionValue: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  computed: {
    ItemContainer: {
      get () {
        return this.container
      },
      set (value) {
        this.$emit('update:container', value)
      }
    },
    ItemOption: {
      get () {
        return this.optionValue
      },
      set (value) {
        this.$emit('update:optionValue', value)
      }
    }
  },
  methods: {
    RemoveItem (index) {
      if (index >= 0) {
        this.$emit('removeitem', index)
      }
    },
    AddNewItem () {
      this.$emit('addnewitem')
    }
  }
}
</script>

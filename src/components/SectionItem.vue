<template>
  <div class="section-item" tabindex="0" @keydown.ctrl.d="RemoveItem">
    <i class="handle el-icon-d-caret" v-if="draggable"/>
    <slot :item="item">
      <span>{{title}}</span>
      <span v-if="description !== ''">
        ( {{description}} )
      </span>
    </slot>
    <i class="edit-button el-icon-edit" @click="EditItem" v-if="editable"/>
    <i class="remove-button el-icon-delete" @click="RemoveItem"/>
  </div>
</template>

<script>
import CaseDocumentHandler from '@/modules/DbItemHandler'

export default {
  name: 'SectionItem',
  props: {
    item: {
      type: Object,
      required: true
    },
    draggable: {
      type: Boolean,
      default: true
    },
    editable: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    title () {
      return CaseDocumentHandler.ItemValue(this.item)
    },
    description () {
      if (this.item.Description) {
        return (Array.isArray(this.item.Description) && this.item.Description.length > 1)
          ? this.item.Description.map(item => item.replace(/[[\]]/g, '')).join(', ')
          : this.item.Description[0].replace(/[[\]]/g, '')
      }
      return ''
    }
  },
  methods: {
    RemoveItem () {
      this.$emit('remove')
    },
    EditItem () {
      this.$emit('edit')
    }
  }
}
</script>

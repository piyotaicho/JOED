<template>
  <div class="section-item">
    <i class="handle el-icon-d-caret" v-if="draggable"></i>
    <slot :item="item">
      <span>{{Title}}</span>
      <span v-if="Description !== ''">
        ( {{Description}} )
      </span>
    </slot>
    <i class="edit-button el-icon-edit" @click="EditItem" v-if="RequireEditing" />
    <i class="remove-button el-icon-delete" @click="RemoveItem" />
  </div>
</template>

<script>
import CaseDocumentHandler from '@/modules/DbItemHandler'

export default {
  name: 'ItemOfSection',
  props: {
    item: {
      type: Object,
      required: true
    },
    draggable: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    Title () {
      return CaseDocumentHandler.ItemValue(this.item)
    },
    Description () {
      if (this.item.Description) {
        return (Array.isArray(this.item.Description) && this.item.Description.length > 1)
          ? this.item.Description.map(item => item.replace(/[[\]]/g, '')).join(', ')
          : this.item.Description[0].replace(/[[\]]/g, '')
      }
      return ''
    },
    RequireEditing () {
      return this.item.UserTyped === true
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

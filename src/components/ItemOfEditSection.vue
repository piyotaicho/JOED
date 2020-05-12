<template>
  <div class="item-description">
    <span class="handle">{{Handle}} </span>
    <slot :item="item">
      <span>{{Title}}</span>
      <span v-if="item.Description">
        ( {{Description}} )
      </span>
    </slot>
    <span class="remove-button" @click="onClick()"> [REMOVE] </span>
  </div>
</template>

<script>
import DbItems from '@/modules/DbItemHandler'

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
    Handle () {
      return this.draggable ? '[ = ]' : ' -- '
    },
    Title () {
      return DbItems.getItemValue(this.item)
    },
    Description () {
      if (this.item.Description) {
        return (this.item.Description.length > 1)
          ? [...this.item.Description].join(', ')
          : this.item.Description[0]
      }
      return ''
    }
  },
  methods: {
    onClick () {
      this.$emit('click')
    }
  }
}
</script>

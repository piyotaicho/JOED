<template>
  <div class="item-description">
    <span class="handle">[ = ] </span>
    <slot :item="item">
      <span>{{Title}}</span>
    </slot>
    <span class="remove-button" @click="onClick()"> [REMOVE] </span>
  </div>
</template>

<script>
import SelectionTree from '@/assets/ItemHandler'

export default {
  name: 'ItemOfSection',
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  computed: {
    Title () {
      return SelectionTree.getPropertyValue(this.item)
    }
  },
  methods: {
    onClick () {
      this.$emit('click')
    }
  }
}
</script>

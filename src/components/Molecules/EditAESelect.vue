<script setup>
import { defineProps, defineEmits, computed } from 'vue'
import EditAESelectValue from './EditAESelectValue.vue'

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  value: {}
})
const emit = defineEmits(['update:value'])
const selectvalue = computed({
  get: () => props.value,
  set: (newvalue) => emit('update:value', newvalue)
})
</script>

<template>
  <div>
    <template v-for="(linearray, lineindex) in items">
      <template v-if="linearray.length === 1 && linearray[0].Label">
        <div :key="lineindex"  style="margin: 0.3rem 0;">
          <span>{{linearray[0].Label}}</span>
        </div>
      </template>
      <div :key="lineindex" v-else>
        <EditAESelectValue
          v-for="(item, itemindex) in linearray"
          :key="itemindex"
          :item="item"
          :value.sync="selectvalue"
        />
      </div>
    </template>
  </div>
</template>

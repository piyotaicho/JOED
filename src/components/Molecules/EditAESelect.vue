<script setup>
import EditAESelectValue from './EditAESelectValue.vue'

const props = defineProps({
  items: {
    type: Array,
    required: true
  }
})

const modelValue = defineModel()
</script>

<template>
  <div>
    <template v-for="(linearray, lineindex) in items" :key="lineindex">
      <template v-if="linearray.length === 1 && linearray[0]?.Label">
        <div style="margin: 0.3rem 0;">
          <span>{{linearray[0].Label}}</span>
        </div>
      </template>
      <template v-else>
        <div>
          <template v-for="(item, itemindex) in linearray" :key="itemindex">
            <EditAESelectValue
              :item="item"
              v-model="modelValue"
            />
          </template>
        </div>
      </template>
    </template>
  </div>
</template>

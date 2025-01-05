<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: 'TEXT FIELD'
  },
  required: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['update:value'])

const inputText = computed({
  get: () => props.value,
  set: (newvalue) => emit('update:value', newvalue)
})
</script>

<template>
  <div style="display: flex; flex-direction: row; height: 2.4rem;">
    <div class="label"><slot name="title"><span>{{title}}</span></slot></div>
    <div class="field">
      <input type="text"
        v-model="inputText"
        :class="[(!inputText && props.required) ? 'vacant' : '']"
        v-bind="$attrs"/>
    </div>
</div>
</template>

<template>
  <div style="display: flex; flex-direction: row; height: 2.4rem;">
    <div class="label"><slot name="title"><span>{{title || '文字入力'}}</span></slot></div>
    <div class="field">
      <input type="text"
        v-model="inputText"
        :class="[(!inputText && props.required) ? 'vacant' : '']"
        v-bind="$attrs"/>
    </div>
</div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'

const props = defineProps(['value', 'required', 'title'])
const emit = defineEmits(['update:value'])

const inputText = computed({
  get: () => props.value,
  set: (newvalue) => emit('update:value', newvalue)
})
</script>

<template>
  <div>
    <div class="label"><span>{{title}}</span></div>
    <div class="field">
      <input type="password"
        v-model="inputText"
        :class="[(inputText === '' && props.required) ? 'vacant' : '']" v-bind="$attrs"/>
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

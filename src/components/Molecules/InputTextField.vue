<script setup>
const props = defineProps({
  title: {
    type: String,
    default: 'TEXT FIELD'
  },
  required: {
    type: Boolean,
    default: false
  },
  password: {
    type: Boolean,
    default: false
  }
})
const inputText = defineModel({ type: String, required: true })
</script>

<template>
  <div style="display: flex; flex-direction: row; height: 2.4rem;">
    <div class="label"><slot name="title"><span>{{title}}</span></slot></div>
    <div class="field">
      <input :type="!password ? 'text' : 'password'"
        v-model="inputText"
        :class="[(!inputText && props.required) ? 'vacant' : '']"
        v-bind="$attrs"/>
    </div>
  </div>
</template>

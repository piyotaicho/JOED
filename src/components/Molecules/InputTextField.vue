<template>
  <div>
    <div class="label"><slot name="title"><span>{{title}}</span></slot></div>
    <div class="field">
      <input type="text"
        v-model="InputText"
        :class="[(!value && required) ? 'vacant' : '']"
        v-bind="$attrs"/>
    </div>
</div>
</template>

<script>
export default {
  name: 'InputTextField',
  props: {
    required: {
      default: false
    },
    value: {
      required: true
    },
    title: {
      default: 'TEXT FIELD'
    }
  },
  computed: {
    InputText: {
      get () { return this.value },
      set (newvalue) {
        this.$emit('input', newvalue)
      }
    }
  }
}
</script>

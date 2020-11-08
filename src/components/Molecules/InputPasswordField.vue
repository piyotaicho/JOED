<template>
  <div>
    <div class="label"><span>{{title}}</span></div>
    <div class="field">
      <input type="password"
        v-model="InputText"
        :class="[(value === '' && required) ? 'vacant' : '']"        v-bind="$attrs"/>
    </div>
</div>
</template>

<script>
export default {
  name: 'InputTextField',
  props: {
    value: {
      required: true
    },
    title: {
      default: 'TEXT FIELD'
    },
    required: {
      default: false
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

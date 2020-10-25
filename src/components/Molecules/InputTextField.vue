<template>
  <div>
    <div class="label"><slot name="title"><span>{{title}}</span></slot></div>
    <div class="field">
      <input type="text"
        v-model="InputText"
        :placeholder="placeholder"
        :class="RequiredClass"
        @keyup.13="$emit('enter')"
        :disabled="disabled"
        :accesskey="accesskey"/>
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
    placeholder: {
      default: ''
    },
    required: {
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    accesskey: {
      type: String
    }
  },
  computed: {
    RequiredClass () {
      return (this.required === true && this.value === '') ? 'vacant' : ''
    },
    InputText: {
      get () { return this.value },
      set (newvalue) {
        this.$emit('input', newvalue)
      }
    }
  }
}
</script>

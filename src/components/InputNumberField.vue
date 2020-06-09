<template>
  <div>
    <div class="label"><span>{{title}}</span></div>
    <div class="field number">
      <input type="number"
        v-model="InputText"
        :placeholder="placeholder"
        :class="RequiredClass"
        :min="min"
        :max="max"/>
    </div>
</div>
</template>

<script>
export default {
  name: 'InputNumberField',
  props: {
    value: {
      type: [Number, String]
    },
    title: {
      default: 'NUMBER FIELD'
    },
    placeholder: {
      default: ''
    },
    min: {
      type: Number
    },
    max: {
      type: Number
    },
    required: {
      default: false
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

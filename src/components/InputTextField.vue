<template>
  <div>
    <div><span>{{title}}</span></div>
    <div>
      <input type="text"
        v-model="InputText"
        :placeholder="placeholder"
        :class="RequiredClass"/>
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

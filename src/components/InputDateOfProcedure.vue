<template>
  <div>
    <div><span class="required">手術日</span></div>
    <div>
      <input type="date"
        v-model="DateOfProcedure"
        :class="(!DateOfProcedure)?'vacant':''"/>
    </div>
</div>
</template>

<script>
export default {
  name: 'InputDateOfProcedure',
  props: ['value'],
  computed: {
    DateOfProcedure: {
      get () { return this.value },
      set (newvalue) {
        this.$emit('input', newvalue)
      }
    }
  }
}
</script>

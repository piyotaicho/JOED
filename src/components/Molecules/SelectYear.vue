<template>
  <div>
    <select v-model="SelectedValue">
      <option v-for="(value, name, index) in Selections" :key="value" :value="name" :selected="index===0">{{name}}年 ({{value}}件)</option>
      <option value="" v-if="acceptAll">すべて</option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'SelectYear',
  model: {
    prop: 'value',
    event: 'update'
  },
  props: {
    value: { required: true },
    acceptAll: { type: Boolean, default: true }
  },
  data () {
    return ({
      Selections: {}
    })
  },
  mounted () {
    this.$store.dispatch('GetYears')
      .then(CountByYear => {
        for (const year in CountByYear) {
          this.$set(this.Selections, year, CountByYear[year])
        }
      })
  },
  computed: {
    SelectedValue: {
      get () { return this.value },
      set (newvalue) { this.$emit('update', newvalue) }
    }
  }
}
</script>

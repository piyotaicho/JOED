<template>
  <div>
    <select v-model="SelectedValue">
      <option value="ALL" v-if="acceptAll">すべて</option>
      <option v-for="item in Selections"
        :key="item.year" :value="item.year">
        {{item.year}}年 ({{item.count}}件)
      </option>
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
      Selections: []
    })
  },
  mounted () {
    this.$store.dispatch('GetYears')
      .then(CountByYear => {
        const years = Object.keys(CountByYear).sort().reverse()
        for (const year of years) {
          this.Selections.push(
            {
              year,
              count: CountByYear[year]
            }
          )
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

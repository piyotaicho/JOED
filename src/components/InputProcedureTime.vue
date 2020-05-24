<template>
  <div>
    <div><span class="required">手術時間</span></div>
    <div>
      <select v-model="ProcedureTime"
        :class="(!ProcedureTime)?'vacant':''">
        <option value="" disabled style="display:none;">手術所要時間</option>
        <option v-for="item in ProcedureTimeSelections"
          :key="item"
          :value="item">
          {{item}}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InputProcedureTime',
  props: ['value'],
  data () {
    return ({
      ProcedureTimeSelections: [
        '30分まで',
        '30分以上 － 60分まで',
        '60分以上 － 90分まで',
        '90分以上 － 120分まで',
        '120分以上 － 150分まで',
        '150分以上 － 180分まで',
        '180分以上 － 210分まで',
        '210分以上 － 240分まで',
        '240分以上 － 270分まで',
        '270分以上 － 300分まで',
        '300分以上 － 330分まで',
        '330分以上 － 360分まで',
        '360分以上 － 420分まで',
        '420分以上 － 480分まで',
        '480分以上'
      ]
    })
  },
  computed: {
    ProcedureTime: {
      get () { return this.value },
      set (newvalue) {
        this.$emit('input', newvalue)
      }
    }
  }
}
</script>

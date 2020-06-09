<template>
  <div>
    <div class="label"><span>手術日</span></div>
    <Datepicker
      v-model="DateOfProcedure"
      wrapper-class="field"
      placeholder="クリックでカレンダー"
      :typeable="true"
      format="yyyy-MM-dd"
      :language="DatepickerTranslation" >
    </Datepicker>
<!--      <input type="date"
        v-model="DateOfProcedure"
        :class="(!DateOfProcedure)?'vacant':''"/> -->
</div>
</template>

<script>
import Datepicker from 'vuejs-datepicker'
import { ja } from 'vuejs-datepicker/dist/locale'

export default {
  name: 'InputDateOfProcedure',
  props: ['value'],
  components: {
    Datepicker
  },
  data () {
    return ({
      DatepickerTranslation: ja
    })
  },
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

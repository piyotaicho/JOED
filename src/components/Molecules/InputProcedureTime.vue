<template>
  <div>
    <div class="label"><span class="required">手術時間</span></div>
    <div class="field">
      <select v-model="ProcedureTime"
        :class="(!ProcedureTime)?'vacant':''"
        @blur="ClearTypedValue()"
        @keypress.esc="ClearTypedValue()"
        @keypress.delete="TypeInChar('DEL')"
        @keypress.48.prevent="TypeInChar('0')" @keypress.96.prevent="TypeInChar('0')"
        @keypress.49.prevent="TypeInChar('1')" @keypress.97.prevent="TypeInChar('1')"
        @keypress.50.prevent="TypeInChar('2')" @keypress.98.prevent="TypeInChar('2')"
        @keypress.51.prevent="TypeInChar('3')" @keypress.99.prevent="TypeInChar('3')"
        @keypress.52.prevent="TypeInChar('4')" @keypress.100.prevent="TypeInChar('4')"
        @keypress.53.prevent="TypeInChar('5')" @keypress.101.prevent="TypeInChar('5')"
        @keypress.54.prevent="TypeInChar('6')" @keypress.102.prevent="TypeInChar('6')"
        @keypress.55.prevent="TypeInChar('7')" @keypress.103.prevent="TypeInChar('7')"
        @keypress.56.prevent="TypeInChar('8')" @keypress.104.prevent="TypeInChar('8')"
        @keypress.57.prevent="TypeInChar('9')" @keypress.105.prevent="TypeInChar('9')"
      >
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
import ProcedureTimeSelections from '@/modules/ProcedureTimes'

export default {
  name: 'InputProcedureTime',
  props: {
    value: {},
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return ({
      ProcedureTimeSelections: ProcedureTimeSelections(),
      typed: ''
    })
  },
  computed: {
    ProcedureTime: {
      get () { return this.value },
      set (newvalue) {
        this.$emit('input', newvalue)
      }
    }
  },
  methods: {
    TypeInChar (char) {
      if (char === 'DEL') {
        this.typed = this.typed.slice(0, -1)
      } else {
        this.typed = (this.typed + char).substr(-4, 4)
      }
      this.ProcedureTime = ProcedureTimeSelections(this.typed)
    },
    ClearTypedValue () {
      this.typed = ''
    }
  }
}
</script>

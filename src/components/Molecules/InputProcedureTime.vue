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
      /*
      const keyCodeToChar = {
        // eslint-disable-next-line object-property-newline
        48: '0', 49: '1', 50: '2', 51: '3', 52: '4', 53: '5', 54: '6', 55: '7', 56: '8', 57: '9',
        // eslint-disable-next-line object-property-newline
        96: '0', 97: '1', 98: '2', 99: '3', 100: '4', 101: '5', 102: '6', 103: '7', 104: '8', 105: '9',
        // eslint-disable-next-line object-property-newline
        186: ':'
      }
      */
      if (char === 'DEL') {
        this.$set(this, 'typed', this.typed.slice(0, -1))
      } else {
        this.$set(this, 'typed', this.typed + char)
      }
      this.$set(this, 'ProcedureTime', ProcedureTimeSelections(this.typed))
    },
    ClearTypedValue () {
      this.$set(this, 'typed', '')
    }
  }
}
</script>

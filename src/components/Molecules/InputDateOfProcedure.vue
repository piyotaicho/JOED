<template>
  <div ref="datepicker">
    <div class="label"><span>手術日</span></div>
    <template>
      <Datepicker
        v-model="DateOfProcedure"
        wrapper-class="field"
        placeholder="クリックでカレンダー"
        :typeable="true"
        format="yyyy-MM-dd"
        :input-class="RequiredClass"
        :language="DatepickerTranslation"
        :disabled="disabled"
        />
    </template>
  </div>
</template>

<script>
import Datepicker from 'vuejs-datepicker'
import { ja } from 'vuejs-datepicker/dist/locale'

export default {
  name: 'InputDateOfProcedure',
  props: {
    value: {},
    required: {
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    tabindex: {
      type: [Number, String]
    }
  },
  components: {
    Datepicker
  },
  data () {
    return ({
      DatepickerTranslation: ja
    })
  },
  mounted () {
    this.SetTabindex()
  },
  computed: {
    DateOfProcedure: {
      get () { return this.value },
      set (newvalue) {
        if (newvalue) {
          // Datepickerから渡されるnewvalueはISO datestrなので整形が必要
          const dateobj = new Date(newvalue)
          const datestr = dateobj.getFullYear() + '-' +
            ('0' + (dateobj.getMonth() + 1)).slice(-2) + '-' +
            ('0' + dateobj.getDate()).slice(-2)
          this.$emit('input', datestr)
        }
      }
    },
    RequiredClass () {
      return (this.required === true && this.value === '') ? 'vacant' : ''
    }
  },
  methods: {
    SetTabindex () {
      if (this.tabindex !== undefined) {
        let inputelement
        try {
          inputelement = this.$refs.datepicker.getElementsByTagName('input')[0]
        } catch {}
        if (inputelement) {
          inputelement.tabIndex = this.tabindex
        }
      }
    }
  }
}
</script>

<template>
  <div class="flex-content" ref="panes">
    <div class="w20 selectionbox">
      <SelectPane
        ref="Pane1"
        :size="Lines"
        :title="Pane1Title"
        v-model="Pane1Selection"
        :items="Pane1Items"
        @change="Pane1Changed()"
        :disabled="disabled"
        >
      </SelectPane>
    </div>
    <div class="w20 selectionbox">
      <SelectPane
        ref="Pane2"
        :size="Lines"
        :title="Pane2Title"
        v-model="Pane2Selection"
        :items="Pane2Items"
        @change="Pane2Changed()"
        :disabled="disabled"
       >
      </SelectPane>
    </div>
    <div class="w60 selectionbox">
      <SelectPane
        ref="Pane3"
        :size="Lines"
        :title="Pane3Title"
        v-model="Pane3Selection"
        :items="Pane3Items"
        @change="Pane3Changed()"
        @keypress-enter="Pane3DblClick()"
        @dblclick="Pane3DblClick()"
        :disabled="disabled"
        >
      </SelectPane>
    </div>
  </div>
</template>

<script>
import SelectPane from '@/components/Molecules/SelectPane'

export default {
  name: 'ThreePaneSelections',
  components: {
    SelectPane
  },
  props: {
    Lines: {
      type: [Number, String],
      default: 8
    },
    Pane1: {
      type: String,
      default: undefined,
      required: true
    },
    Pane1Title: {
      type: String,
      default: 'カテゴリ'
    },
    Pane1Items: {
      type: Array,
      default: () => [],
      required: true
    },
    Pane2: {
      type: String,
      default: '',
      required: true
    },
    Pane2Title: {
      type: String,
      default: '対象臓器'
    },
    Pane2Items: {
      type: Array,
      default: () => [],
      required: true
    },
    Pane3: {
      type: String,
      default: '',
      required: true
    },
    Pane3Title: {
      type: String,
      default: '候補'
    },
    Pane3Items: {
      type: Array,
      default: () => [],
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  mounted () {
    this.$nextTick(_ => {
      const selects = this.$refs.panes.getElementsByTagName('select')
      if (selects && selects.length > 0) {
        selects[0].focus()
      }
    })
  },
  computed: {
    Pane1Selection: {
      get () {
        return this.Pane1
      },
      set (value) {
        this.$emit('update:pane1', value)
      }
    },
    Pane2Selection: {
      get () {
        return this.Pane2
      },
      set (value) {
        this.$emit('update:pane2', value)
      }
    },
    Pane3Selection: {
      get () {
        return this.Pane3
      },
      set (value) {
        this.$emit('update:pane3', value)
      }
    }
  },
  methods: {
    Pane1Changed (value) {
      this.$refs.Pane2.Clear()
      this.$refs.Pane3.Clear()
      this.$emit('pane1change', value)
    },
    Pane2Changed (value) {
      this.$refs.Pane3.Clear()
      this.$emit('pane2change', value)
    },
    Pane3Changed (value) {
      this.$emit('pane3change', value)
    },
    Pane3DblClick (value) {
      this.$emit('pane3dblclick', value)
    },
    ClearPane2 () {
      this.$refs.Pane3.Clear()
    },
    ClearPane3 () {
      this.$refs.Pane3.Clear()
    }
  }
}
</script>

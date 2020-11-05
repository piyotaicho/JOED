<template>
  <div>
    <div class="subtitle">{{title}}</div>
    <select tabindex="0"
      ref="SelectPane" :size="lines"
      v-model="PaneValue"
      @change="Change()"
      @keypress.enter="Enter()"
      @dblclick="DblClick()"
      :disabled="disabled">
      <option v-if="items.length===0" disabled :value="null"/>
      <option v-for="(item,key,index) in items"
        :key="index"
        :value="item">
        {{item}}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'SelectPane',
  model: {
    prop: 'value',
    event: 'change-selection'
  },
  props: {
    value: {
      type: String,
      default: null
    },
    title: {
      type: String,
      default: '項目'
    },
    items: {
      type: Array,
      default: () => [],
      required: true
    },
    lines: {
      type: [String, Number],
      default: 8
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    PaneValue: {
      get () {
        return this.value
      },
      set (value) {
        this.$emit('change-selection', value)
      }
    }
  },
  methods: {
    Change (value) {
      this.$emit('change', value)
    },
    DblClick (value) {
      this.$emit('dblclick', value)
    },
    Enter (value) {
      this.$emit('keypress-enter', value)
    },
    Clear () {
      this.$refs.SelectPane.selectIndex = -1
    }
  }
}
</script>

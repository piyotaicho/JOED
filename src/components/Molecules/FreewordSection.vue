<template>
  <div class="flex-content inputbox">
    <div class="w20"></div>
    <div class="w20 subtitle">
      <div tabindex="0" @click="Toggle">
        <span>自由入力</span>
        <span style="padding-left: 1rem;">
          <i :class="[expandInput ? 'el-icon-d-arrow-left' : 'el-icon-d-arrow-right']"/>
        </span>
      </div>
    </div>
    <div class="w40" v-show="expandInput">
        <input type="text"
          v-model="typedValue"
          :disabled="disabled"
          placeholder="カテゴリ選択後に入力・検索可能になります"
          ref="input"
        />
    </div>
    <div class="w20" v-show="expandInput">
      <el-button type="primary" @click="OnSearch" icon="el-icon-search" :disabled="disabled">候補を検索</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FreewordSection',
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: {
      type: String
    },
    disabled: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      expandInput: false
    }
  },
  mounted () {
    if (this.value !== '') {
      this.$set(this, 'expandInput', true)
    }
  },
  computed: {
    typedValue: {
      get () { return this.value },
      set (value) { this.$emit('change', value) }
    }
  },
  methods: {
    Toggle () {
      this.expandInput = !this.expandInput
      if (this.expandInput) {
        this.$nextTick().then(_ => this.$refs.input.focus())
      }
    },
    OnSearch () {
      this.$emit('click-search')
    }
  }
}
</script>

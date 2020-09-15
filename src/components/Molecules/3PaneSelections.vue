<template>
  <div class="flex-content">
    <div class="w20 selectionbox">
      <div class="subtitle-section">{{Pane1Title}}</div>
      <select ref="SelectPane1" size="8"
        v-model="Pane1Selection"
        @change="Pane1Changed()">
        <option v-if="Pane1Items.length===0" disabled :value="null"/>
        <option v-for="(item,key,index) in Pane1Items"
          :key="index"
          :value="item">
          {{item}}
        </option>
      </select>
    </div>
    <div class="w20 selectionbox">
      <div class="subtitle-section">{{Pane2Title}}</div>
      <select ref="SelectPane2" size="8"
        v-model="Pane2Selection"
        @change="Pane2Changed()">
        <option v-if="Pane2Items.length===0" disabled :value="null"/>
        <option v-for="(item,key,index) in Pane2Items"
          :key="index"
          :value="item">
          {{item}}
        </option>
      </select>
    </div>
    <div class="w60 selectionbox">
      <div class="subtitle-section">{{Pane3Title}}</div>
      <select ref="SelectPane3" :size="Lines"
        v-model="Pane3Selection"
        @change="Pane3Changed()"
        @dblclick="Pane3DblClick()">
        <option v-if="Pane3Items.length===0" disabled :value="null"/>
        <option v-for="(item,key,index) in Pane3Items"
          :key="index"
          :value="item">
          {{item}}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ThreePaneSelections',
  props: {
    Lines: {
      type: [Number, String],
      default: 8
    },
    // Pane[1-3]のプロパティにはv-bind.syncを使用する
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
      default: undefined,
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
      default: undefined,
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
    }
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
      this.$refs.SelectPane2.selectedIndex = -1
      this.$refs.SelectPane3.selectedIndex = -1
      this.$emit('Pane1Change', value)
    },
    Pane2Changed (value) {
      this.$refs.SelectPane3.selectedIndex = -1
      this.$emit('Pane2Change', value)
    },
    Pane3Changed (value) {
      this.$emit('Pane3Change', value)
    },
    Pane3DblClick (value) {
      this.$emit('Pane3DblClick', value)
    }
  }
}
</script>

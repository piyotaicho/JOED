<template>
  <div>
    <template v-for="(linearray, lineindex) in items">
      <template v-if="linearray.length === 1 && linearray[0].Label">
        <div :key="lineindex"  style="margin: 0.3rem 0;">
          <span>{{linearray[0].Label}}</span>
        </div>
      </template>
      <div :key="lineindex" v-else>
        <EditAESelectValue
          v-for="(item, itemindex) in linearray"
          :key="itemindex"
          :item="item"
          v-model="selectvalue"
        />
      </div>
    </template>
  </div>
</template>

<script>
import EditAESelectValue from './EditAESelectValue.vue'

export default {
  components: {
    EditAESelectValue
  },
  props: {
    items: {
      type: Array,
      required: true
    },
    value: {}
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  computed: {
    selectvalue: {
      get () {
        return this.value
      },
      set (newvalue) {
        this.$emit('change', newvalue)
      }
    }
  },
  methods: {}
}
</script>

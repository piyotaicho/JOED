<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import SelectPane from '@/components/Molecules/SelectPane.vue'

const props = defineProps({
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
})

const emit = defineEmits(['update:pane1', 'update:pane2', 'update:pane3', 'pane1change', 'pane2change', 'pane3change', 'pane3dblclick'])

const panes = ref()
const pane1 = ref()
const pane2 = ref()
const pane3 = ref()

onMounted(() => {
  nextTick(() => {
    const selects = panes.value.getElementsByTagName('SELECT')
    if (selects && selects.length > 0) {
      selects[0].focus()
    }
  })
})

const pane1Selection = computed({
  get: () => props.Pane1,
  set: (value) => emit('update:pane1', value)
})

const pane2Selection = computed({
  get: () => props.Pane2,
  set: (value) => emit('update:pane2', value)
})

const pane3Selection = computed({
  get: () => props.Pane3,
  set: (value) => emit('update:pane3', value)
})

const pane1Changed = (value) => {
  clearPane2()
  clearPane3()
  emit('pane1change', value)
}

const pane2Changed = (value) => {
  clearPane3()
  emit('pane2change', value)
}

const pane3Changed = (value) => emit('pane3change', value)

const pane3DblClick = (value) => emit('pane3dblclick', value)

const clearPane2 = () => pane2.value.clearSelection()

const clearPane3 = () => pane3.value.clearSelection()
</script>

<template>
  <div class="flex-content" ref="panes">
    <div class="w20 selectionbox">
      <SelectPane
        ref="pane1"
        :size="props.Lines"
        :title="props.Pane1Title"
        v-model:value="pane1Selection"
        :items="props.Pane1Items"
        @change="pane1Changed"
        :disabled="props.disabled"
        >
      </SelectPane>
    </div>
    <div class="w20 selectionbox">
      <SelectPane
        ref="pane2"
        :size="props.Lines"
        :title="props.Pane2Title"
        v-model:value="pane2Selection"
        :items="props.Pane2Items"
        @change="pane2Changed"
        :disabled="disabled"
       >
      </SelectPane>
    </div>
    <div class="w60 selectionbox">
      <SelectPane
        ref="pane3"
        :size="props.Lines"
        :title="props.Pane3Title"
        v-model:value="pane3Selection"
        :items="props.Pane3Items"
        @change="pane3Changed"
        @keypress-enter="pane3DblClick"
        @dblclick="pane3DblClick"
        :disabled="disabled"
        >
      </SelectPane>
    </div>
  </div>
</template>

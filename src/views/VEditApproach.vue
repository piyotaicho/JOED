<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import TheWrapper from '@/components/Atoms/TheWrapper.vue'
import EditSection from '@/components/Molecules/EditSection.vue'
import LabeledCheckbox from '@/components/Atoms/LabeledCheckbox.vue'
import LabeledRadio from '@/components/Atoms/LabeledRadio.vue'
import ApproachMaster from '@/modules/Masters/ApproachMaster'
import * as Popups from '@/modules/Popups'

const router = useRouter()

const props = defineProps({
  value: {
    type: String
  },
  year: {
    type: String
  },
  procedureTypes: {
    type: String,
    required: true
  }
})
const emit = defineEmits(['data-upsert'])

// マスターデータ取得(non-reactive)
const master = new ApproachMaster(props.year || '')
// propsのprocedureTypesを配列化(non-reactive)
const procedureTypes = master.getCategories(JSON.parse(props.procedureTypes || '[]'))
// マスターツリー取得(non-reactive)
const masterTree = master.getTree(master.getCategories(procedureTypes))

// reactivities
const categorySelections = ref({})
const categorySelectionOfOneOf = ref({})
for (const category of procedureTypes) {
  categorySelections.value[category] = []
  categorySelectionOfOneOf.value[category] = ''
}
const required = computed(() => { return (category) => {
  return (
    categorySelectionOfOneOf.value[category] === undefined ||
    categorySelectionOfOneOf.value[category] === null ||
    categorySelectionOfOneOf.value[category] === ''
  )
}})

onMounted(() => {
  // props.valueから選択状態を復元
  if (props.value) {
    // RouteパラメータはJSON文字列化されているのでパースする
    const value = JSON.parse(props.value)

    // procedureTypeが展開されているのでそれに従って値を復元する
    // 無効な項目は選択肢から 排除される
    for (const category of master.getCategories(Object.keys(value))) {
      const oneOfItems = (masterTree[category]
        ?.filter(directive => Object.keys(directive)[0] === 'oneOf')[0]
        ?.oneOf) || []
      const otherItems = (masterTree[category]
        ?.filter(directive => Object.keys(directive)[0] !== 'oneOf')
        ?.map(directive => directive[Object.keys(directive)[0]])
        .flat(2)) || []

      for (const selection of value[category] || []) {
        if (oneOfItems.includes(selection)) {
          // oneOfの項目は1つだけ
          categorySelectionOfOneOf.value[category] = selection
          continue
        }

        if (otherItems.includes(selection)) {
          // その他の項目の場合は複数選択として扱う
          categorySelections.value[category].push(selection)
        }
      }
    }
  }
})

const CommitChange = async () => {
  // 現在の選択内容をemitする
  const returnValue = {}
  for (const category of procedureTypes) {
    returnValue[category] = []
    if (categorySelectionOfOneOf?.value[category] === undefined || categorySelectionOfOneOf.value[category] === '') {
      await Popups.information(`カテゴリ ${category} の必須項目が選択されていません.`)
      return
    }
    returnValue[category].push(categorySelectionOfOneOf.value[category])
    returnValue[category].push(...(categorySelections.value[category] || []))
  }

  emit('data-upsert', 'Approach', 0, JSON.stringify(returnValue))
  GoBack()
}

const GoBack = () => router.replace('./')
</script>

<template>
  <TheWrapper alpha="10">
    <EditSection @commit="CommitChange" @discard="GoBack">
      <template v-for="category of procedureTypes" :key="category">
        <div class="flex-content" aria-category="{{ category }}" style="margin-bottom: 1.2rem;">
          <div class="w20">{{ category }}</div>
          <div class="w80">
            <template v-for="directive of masterTree[category]" :key="directive">
              <template v-if="Object.keys(directive)[0] === 'oneOf'">
                  <template v-for="item in directive.oneOf" :key="item">
                    <LabeledRadio v-model="categorySelectionOfOneOf[category]" :value="item" :required="required(category)"/>
                  </template>
                  <br/><br/>
              </template>
              <template v-if="Object.keys(directive)[0] === 'anyOf' || Object.keys(directive)[0] === 'check'">
                <template v-for="item in (directive.anyOf || directive.check)" :key="item">
                  <LabeledCheckbox v-model="categorySelections[category]" :value="item" />
                </template>
                <br/>
              </template>
            </template>
          </div>
        </div>
      </template>
    </EditSection>
  </TheWrapper>
</template>

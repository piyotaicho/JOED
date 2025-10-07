<template>
  <TheWrapper alpha="10">
    <EditSection @commit="CommitChanges" @discard="GoBack">
      <div class="flex-content" ref="paneSection">
        <div class="w20 selectionbox">
          <SelectPane title="カテゴリ" v-model="category" :items="categorySelections" />
        </div>
        <div class="w20 selectionbox">
          <SelectPane title="対象臓器" v-model="target" :items="targetSelections" />
        </div>
        <div class="w60 selectionbox">
          <SelectPane title="手術診断の候補" v-model="selectedItem" :items="candidates" @dblclick="CommitChanges()" />
        </div>
      </div>

      <FreewordSection
        v-model:value="freewordText"
        :disabled="!UserEditingAllowed"
        @click-search="SetCandidateItemsByFreeword"
        ref="freewordSection"
      />
    </EditSection>
  </TheWrapper>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Master from '@/modules/Masters/DiagnosisMaster'
import * as Popups from '@/modules/Popups'
import TheWrapper from '@/components/Atoms/TheWrapper.vue'
import EditSection from '@/components/Molecules/EditSection.vue'
// import ThreePaneSelections from '@/components/Molecules/ThreePaneSelections.vue'
import SelectPane from '@/components/Molecules/SelectPane.vue'
import FreewordSection from '@/components/Molecules/EditSectionFreeword.vue'

const DiagnosesMaster = new Master()

const router = useRouter()

const props = defineProps({
  ItemIndex: {
    type: Number,
    default: -1,
  },
  ItemValue: {
    type: String,
  },
  year: {
    type: String,
    default: '',
  },
})
const emit = defineEmits(['data-upsert'])
const paneSection = ref()
const freewordSection = ref()

// 選択肢の設定
const category = ref('')
const categorySelections = computed(() => DiagnosesMaster.Categories())

const target = ref('')
const targetSelections = computed(() => DiagnosesMaster.Targets(category.value))

const selectedItem = ref('')
const candidates = ref([])
const UserEditingAllowed = computed(() => !!category.value && !selectedItem.value)
const freewordText = ref('')

onMounted(async () => {
  const item = JSON.parse(props.ItemValue || '{}')
  const selectElements = paneSection.value.getElementsByTagName('SELECT')

  if (props.ItemIndex > -1) {
    // ItemIndex != -1 の場合は新規ではなく再編集

    // カテゴリ・対象の解釈
    if (item?.Chain[0] !== undefined) {
      category.value = item.Chain[0]
      await nextTick()
      if (item.Chain[1] !== undefined) {
        target.value = item.Chain[1]
        await nextTick()
      }
    }

    // カテゴリとあれば対象に応じた選択リストの生成
    await SetCandidateItemsBySelection()

    if (item?.Text && candidates.value.includes(item.Text)) {
      // 選択肢に該当項目そのものがある場合選択する
      selectedItem.value = item.Text
      freewordText.value = ''
      await nextTick()
      if (selectElements && selectElements.length >= 3) {
        selectElements[2].focus()
      }
    } else {
      // 選択肢に入力されている項目がなければ自由入力に展開する
      selectedItem.value = ''
      freewordText.value = item.Text
      await nextTick()
      freewordSection.value.open()
    }
  } else {
    // 新規編集の場合はカテゴリにフォーカスする
    if (selectElements && selectElements.length >= 1) {
      selectElements[0].focus()
    }
  }
})

watch(category, async () => {
  // カテゴリが変更されたら現在の入力は全部クリア
  target.value = ''
  selectedItem.value = ''
  freewordText.value = ''
  await nextTick()

  // targetSelectionが一つだけの時はそれを選択
  if (targetSelections.value.length === 1) {
    target.value = targetSelections.value[0]
    await nextTick()
  }
  SetCandidateItemsBySelection()
})

watch(target, () => {
  if (target.value !== '') {
    SetCandidateItemsBySelection()
  }
})

const SetCandidateItemsBySelection = async () => {
  candidates.value = DiagnosesMaster.Items(category.value, target.value, props.year).map(
    (item) => item.Text,
  )
  selectedItem.value = ''
  await nextTick()
}

const SetCandidateItemsByFreeword = async () => {
  if (freewordText.value && UserEditingAllowed.value) {
    candidates.value.splice(
      0,
      candidates.value.length,
      ...DiagnosesMaster.Matches(
        freewordText.value,
        category.value,
        target.value || '',
        props.year,
      ),
    )
    await nextTick()
  }
}

const CommitChanges = async () => {
  const temporaryItem = {}
  if (selectedItem.value !== '') {
    // 選択された内容が最優先
    // 選択されたものには適切な付随情報を収納
    temporaryItem.Text = selectedItem.value
    temporaryItem.Chain = [category.value, ...(target.value !== '' ? [target.value] : [])]
  } else {
    if (freewordText.value.trim() !== '') {
      // 自由入力は兎にも角にも候補入力を優先させる.
      SetCandidateItemsByFreeword()
      if (
        candidates.value.length !== 0 &&
        (await Popups.confirm('手術診断の候補があります,選択を優先してください.')) === false
      ) {
        return
      }
      // 候補に入力と同じものがある場合は何が何でも選択させる.
      if (candidates.value.indexOf(freewordText.value.trim()) !== -1) {
        await Popups.information('自由入力の内容が候補にありますのでそれを選択してください.')
        return
      }
      // 最終確認
      if (
        (await Popups.confirm('直接入力した手術診断の登録は可能な限り控えてください.')) === false
      ) {
        return
      }

      // ユーザ手入力の場合は選択が掛かっていないので最低限の情報のみかつフラグを必ず立てる
      temporaryItem.Text = freewordText.value.trim()
      temporaryItem.Chain = [category.value]
      temporaryItem.UserTyped = true
    }
  }
  // 新しいレコードが作成されていたら登録, そうでなければなにもしない.
  if (temporaryItem.Text) {
    emit('data-upsert', 'Diagnoses', props.ItemIndex, JSON.stringify(temporaryItem))
    GoBack()
  }
}

const GoBack = () => router.replace('./')
</script>

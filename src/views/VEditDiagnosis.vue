<template>
  <TheWrapper alpha="10">
    <EditSection @commit="CommitChanges" @discard="GoBack">
      <ThreePaneSelections
        Pane3Title="手術診断の候補"
        v-model:Pane1="category" :Pane1Items="Categories"
        @pane1change="CategoryIsChanged()"
        v-model:Pane2="target" :Pane2Items="TargetOrgans"
        @pane2change="SetCandidateItemsBySelection()"
        v-model:Pane3="selectedItem" :Pane3Items="candidates"
        @pane3dblclick="CommitChanges()"
        ref="paneSection"
      />

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
import { ref, computed, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Master from '@/modules/Masters/DiagnosisMaster'
import * as Popups from '@/modules/Popups'
import TheWrapper from '@/components/Atoms/TheWrapper.vue'
import EditSection from '@/components/Molecules/EditSection.vue'
import ThreePaneSelections from '@/components/Molecules/ThreePaneSelections.vue'
import FreewordSection from '@/components/Molecules/EditSectionFreeword.vue'

const DiagnosesMaster = new Master()

const router = useRouter()

const props = defineProps({
  ItemIndex: {
    type: Number,
    default: -1
  },
  ItemValue: {
    type: String
  },
  year: {
    type: String,
    default: ''
  }
})
const emit = defineEmits(['data-upsert'])
const paneSection = ref()
const freewordSection = ref()

const category = ref('')
const target = ref('')
const candidates = ref([])
const selectedItem = ref('')
const freewordText = ref('')

const Categories = computed(() => DiagnosesMaster.Categories())
const TargetOrgans = computed(() => DiagnosesMaster.Targets(category.value))

const UserEditingAllowed = computed(() => !!category.value && !selectedItem.value)

const CategoryIsChanged = async () => {
  target.value = ''
  if (selectedItem.value !== '') {
    freewordText.value = ''
  }

  selectedItem.value = ''
  if (candidates.value.length > 0) {
    candidates.value.splice(0)
  }

  await nextTick()

  // 対象臓器が1つだけのときはそれを選択する
  if (TargetOrgans.value.length === 1) {
    target.value = TargetOrgans.value[0]
    await nextTick()

    // 選択に応じた選択肢を展開
    SetCandidateItemsBySelection()
    await nextTick()
  }
}

const SetCandidateItemsBySelection = async () => {
  candidates.value = DiagnosesMaster.Items(
    category.value, target.value, props.year
  ).map(item => item.Text)
  selectedItem.value = ''
  await nextTick()
}

const SetCandidateItemsByFreeword = async () => {
  if (freewordText.value && UserEditingAllowed.value) {
    candidates.value.splice(0, candidates.value.length,
      ...DiagnosesMaster.Matches(freewordText.value, category.value, target.value || '', props.year))
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
        await Popups.confirm('手術診断の候補があります,選択を優先してください.') === false
      ) {
        return
      }
      // 候補に入力と同じものがある場合は何が何でも選択させる.
      if (candidates.value.indexOf(freewordText.value.trim()) !== -1) {
        await Popups.information('自由入力の内容が候補にありますのでそれを選択してください.')
        return
      }
      // 最終確認
      if (await Popups.confirm('直接入力した手術診断の登録は可能な限り控えてください.') === false) {
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

onMounted(async () => {
  const item = JSON.parse(props.ItemValue || '{}')
  if (props.ItemIndex > -1) {
    // ItemIndex != -1 の場合は新規ではなく再編集

    // カテゴリ・対象の解釈
    const dummyChain = [...(item?.Chain || []), ' ', ' ']
    category.value = dummyChain[0]
    target.value = dummyChain[1]
    await nextTick()

    // カテゴリとあれば対象に応じた選択リストの生成
    await SetCandidateItemsBySelection()

    if (item?.Text && candidates.value.includes(item.Text)) {
      // 選択肢に該当項目そのものがある場合選択する
      selectedItem.value = item.Text
      freewordText.value = ''
      await nextTick()
      paneSection.value.$el.getElementsByTagName('select')[2].focus()
    } else {
      // 選択肢に入力されている項目がなければ自由入力に展開する
      selectedItem.value = ''
      freewordText.value = item.Text
      await nextTick()
      freewordSection.value.open()
    }
  }
})
</script>

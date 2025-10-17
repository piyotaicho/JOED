<script setup>
import TheWrapper from '@/components/Atoms/TheWrapper.vue'
import EditSection from '@/components/Molecules/EditSection.vue'
import { useRouter } from 'vue-router'
import ApproachMaster from '@/modules/Masters/ApproachMaster'

const router = useRouter()

const props = defineProps({
  value: {
    type: String
  },
  year: {
    type: String
  },
  procedureTypes: {
    type: Array,
    required: true
  }
})
const emit = defineEmits(['data-upsert'])

const oneof = ref('')
const anyof = ref([])
const check = ref([])

const master = new ApproachMaster(props.year || '')
const masterTree = master.getTree(props.procedureTypes || [])

const CommitChange = () => {
  emit('data-upsert', props.value)
  GoBack()
}

const GoBack = () => router.replace('./')
</script>

<template>
  <TheWrapper alpha="10">
    <EditSection @commit="CommitChange" @discard="GoBack">
      <template v-for="category of Object.keys(masterTree)" :key="category">
        <div class="flex-content">
          <div class="w20">{{ category }}</div>
          <template v-for="directive of Object.keys(masterTree[category])" :key="directive">
            <div class="w80">
              <template v-if="directive === 'oneOf'">
                <div>
                  <el-radio-group v-model="oneof">
                    <template v-for="item in masterTree[category][directive]" :key="item">
                      <el-radio :value="item">{{ item }}</el-radio>
                    </template>
                  </el-radio-group>
                </div>
              </template>
              <template v-if="directive === 'anyOf'">
                <div>
                  <el-checkbox-group v-model="anyof">
                    <template v-for="item in masterTree[category][directive]" :key="item">
                      <el-checkbox :label="item">{{ item }}</el-checkbox>
                    </template>
                  </el-checkbox-group>
                </div>
              </template>
              <template v-if="directive === 'check'">
                <div>
                  <el-checkbox-group v-model="check">
                    <template v-for="line in masterTree[category][directive]" :key="line">
                      <div>
                        <template v-for="item in line" :key="item">
                          <el-checkbox :label="item">{{ item }}</el-checkbox>
                        </template>
                      </div>
                    </template>
                  </el-checkbox-group>
                </div>
              </template>
            </div>
          </template>
        </div>
      </template>
    </EditSection>
  </TheWrapper>
</template>

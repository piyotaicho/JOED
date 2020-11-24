<template>
  <TheWrapper alpha="10">
    <EditSection @commit="CommitChanges" @discard="GoBack">
      <div class="flex-content">
        <div class="w20 subtitle">
          <span>合併症の内容</span>
        </div>
        <div class="w80">
          <select v-model="Category" @change="CategoryChanged()" ref="firstelement">
            <option value="" disabled style="display:none;">リストから選択</option>
            <option value="出血">総出血量500ml以上</option>
            <option value="術中手術操作">術中手術操作に伴う合併症・偶発症</option>
            <option value="気腹・潅流操作">気腹・潅流操作に伴う合併症・偶発症</option>
            <option value="機器の不具合・破損">機器の不具合・破損に伴う合併症・偶発症</option>
            <option value="機器の誤操作">機器の誤操作に伴う合併症・偶発症</option>
            <option value="術中使用した薬剤">術中使用した薬剤に伴う合併症</option>
            <option value="体腔内遺残">体腔内遺残</option>
            <option value="術後">術後合併症</option>
          </select>
        </div>
      </div>
      <div class="flex-content" v-if="showPerfusionRelated">
        <div class="w20 subtitle">
          <span>発生した合併症</span>
        </div>
        <div class="w80 AEcheckboxes">
          <div>
            <LabeledCheckbox v-model="AE.Title" value="皮下気腫"/>
            <LabeledCheckbox v-model="AE.Title" value="ガス塞栓(炭酸ガス)">炭酸ガス塞栓</LabeledCheckbox>
            <LabeledCheckbox v-model="AE.Title" value="ガス塞栓(空気)">空気塞栓</LabeledCheckbox>
          </div>
          <div>
            <LabeledCheckbox v-model="AE.Title" value="経過観察">経過観察</LabeledCheckbox>
            <LabeledCheckbox v-model="AE.Title" value="水中毒">水中毒</LabeledCheckbox>
          </div>
          <div>
            <LabeledCheckbox v-model="AE.Title" value="そのほか心臓障害"/>
            <LabeledCheckbox v-model="AE.Title" value="そのほか呼吸器障害"/>
            <LabeledCheckbox v-model="AE.Title" value="そのほか神経系障害"/>
          </div>
          <div>
            <LabeledCheckbox v-model="AE.Title" value="上記以外"/>
          </div>
        </div>
      </div>
      <div class="flex-content" v-if="showInjuriesCause">
        <div class="w20 subtitle">
          <span>関連する機器</span>
        </div>
        <div class="w80 AEcheckboxes">
          <div>
            <LabeledCheckbox v-model="AE.Cause" value="鉗子"/>
            <LabeledCheckbox v-model="AE.Cause" value="内視鏡">内視鏡(スコープ・シース)</LabeledCheckbox>
            <LabeledCheckbox v-model="AE.Cause" value="カテーテル">カテーテル・ガイドワイヤー</LabeledCheckbox>
          </div>
          <div>
            <LabeledCheckbox v-model="AE.Cause" value="内視鏡関連装置"/>
            <LabeledCheckbox v-model="AE.Cause" value="潅流気腹装置">潅流・気腹装置</LabeledCheckbox>
          </div>
          <div>
            <LabeledCheckbox v-model="AE.Cause" value="トロッカー"/>
          </div>
          <div>
            <LabeledCheckbox v-model="AE.Cause" value="子宮操作器具">子宮マニピュレーター・腟カップ・パイプ</LabeledCheckbox>
          </div>
          <div>
            <LabeledCheckbox v-model="AE.Cause" value="組織回収器具">組織回収器具（袋）・モルセレーター</LabeledCheckbox>
          </div>
          <div>
            <LabeledCheckbox v-model="AE.Cause" value="止血材料">血管クリップ・縫合糸</LabeledCheckbox>
            <LabeledCheckbox v-model="AE.Cause" value="ステープラー">自動縫合・吻合器</LabeledCheckbox>
          </div>
          <div>
            <LabeledCheckbox v-model="AE.Cause" value="電気メス">電気メス（モノポーラー・バイポーラー・アルゴンビーム）</LabeledCheckbox>
          </div>
          <div>
            <LabeledCheckbox v-model="AE.Cause" value="SUS">超音波凝固切開装置</LabeledCheckbox>
            <LabeledCheckbox v-model="AE.Cause" value="VSS">ベッセルシーリングシステム</LabeledCheckbox>
          </div>
          <div>
            <LabeledCheckbox v-model="AE.Cause" value="レーザー"/>
            <LabeledCheckbox v-model="AE.Cause" value="マイクロ波"/>
          </div>
          <div>
            <LabeledCheckbox v-model="AE.Cause" value="上記にないもの"/>
          </div>
        </div>
      </div>
      <div class="flex-content" v-if="showInjuriesTitle">
        <div class="w20 subtitle">
          <span>発生した合併症</span>
        </div>
        <div class="w80 AEcheckboxes">
          <div>
            <LabeledCheckbox v-model="AE.Title" value="臓器損傷"/>
            <LabeledCheckbox v-model="AE.Title" value="出血"/>
          </div>
        </div>
      </div>
      <div class="flex-content" v-if="showDrugRelated">
        <div class="w20 subtitle">
          <span>関連する薬剤</span>
        </div>
        <div class="w80 AEcheckboxes">
          <div>
            <LabeledCheckbox v-model="AE.Cause" value="バソプレッシン"/>
            <LabeledCheckbox v-model="AE.Cause" value="アドレナリン"/>
          </div>
          <div>
            <LabeledCheckbox v-model="AE.Cause" value="インジゴカルミン"/>
          </div>
          <div>
            <LabeledCheckbox v-model="AE.Cause" value="上記にないもの"/>
          </div>
        </div>
      </div>
      <div class="flex-content" v-if="showDrugRelated">
        <div class="w20 subtitle">
          <span>発生した合併症</span>
        </div>
        <div class="w80 AEcheckboxes">
          <LabeledCheckbox v-model="AE.Title" value="アナフィラキシー"/>
          <LabeledCheckbox v-model="AE.Title" value="心停止"/>
          <LabeledCheckbox v-model="AE.Title" value="徐脈"/>
          <LabeledCheckbox v-model="AE.Title" value="頻脈"/>
          <LabeledCheckbox v-model="AE.Title" value="それ以外"/>
        </div>
      </div>
      <div class="flex-content" v-if="showRemnunts">
        <div class="w20 subtitle">
          <span>遺残したもの</span>
        </div>
        <div class="w80 AEcheckboxes">
          <div>
            <LabeledCheckbox v-model="AE.Cause" value="検体"/>
          </div>
          <div>
            <LabeledCheckbox v-model="AE.Cause" value="器械"/>
          </div>
          <div>
            <LabeledCheckbox v-model="AE.Cause" value="ガーゼなど衛生材料"/>
          </div>
          <div>
            <LabeledCheckbox v-model="AE.Cause" value="針"/>
          </div>
          <div>
            <LabeledCheckbox v-model="AE.Cause" value="上記にないもの"/>
          </div>
        </div>
      </div>
      <div class="flex-content" v-if="showPostoperative">
        <div class="w20 subtitle">
          <span>合併症の内容</span>
        </div>
        <div class="w80 AEcheckboxes">
          <div>
            <LabeledCheckbox v-model="AE.Title" value="出血"/>
            <LabeledCheckbox v-model="AE.Title" value="血腫"/>
          </div>
          <div>
            <LabeledCheckbox v-model="AE.Title" value="創部感染"/>
            <LabeledCheckbox v-model="AE.Title" value="創離開"/>
            <LabeledCheckbox v-model="AE.Title" value="腟断端部離開"/>
          </div>
          <div>
            <LabeledCheckbox v-model="AE.Title" value="腹膜炎"/>
            <LabeledCheckbox v-model="AE.Title" value="子宮感染"/>
            <LabeledCheckbox v-model="AE.Title" value="卵管・卵巣感染"/>
          </div>
          <div>
            <LabeledCheckbox v-model="AE.Title" value="イレウス">イレウス(腸管麻痺)</LabeledCheckbox>
            <LabeledCheckbox v-model="AE.Title" value="腸閉塞">腸閉塞(機械的閉塞・絞扼性イレウス)</LabeledCheckbox>
            <LabeledCheckbox v-model="AE.Title" value="消化管穿孔"/>
          </div>
          <div>
            <LabeledCheckbox v-model="AE.Title" value="腹壁瘢痕・ポートサイトヘルニア"/>
          </div>
          <div>
            <LabeledCheckbox v-model="AE.Title" value="尿管損傷"/>
            <LabeledCheckbox v-model="AE.Title" value="尿路閉塞"/>
            <LabeledCheckbox v-model="AE.Title" value="膀胱損傷"/>
          </div>
          <div>
            <LabeledCheckbox v-model="AE.Title" value="肺動脈血栓塞栓症"/>
            <LabeledCheckbox v-model="AE.Title" value="深部静脈血栓症"/>
          </div>
          <div>
            <LabeledCheckbox v-model="AE.Title" value="気胸"/>
            <LabeledCheckbox v-model="AE.Title" value="心肺停止"/>
            <LabeledCheckbox v-model="AE.Title" value="コンパートメント症候群"/>
          </div>
          <div>
            <LabeledCheckbox v-model="AE.Title" value="上肢神経障害"/>
            <LabeledCheckbox v-model="AE.Title" value="下肢神経障害"/>
          </div>
          <div>
            <LabeledCheckbox v-model="AE.Title" value="リンパ浮腫"/>
            <LabeledCheckbox v-model="AE.Title" value="非感染性リンパ嚢胞"/>
            <LabeledCheckbox v-model="AE.Title" value="感染性リンパ嚢胞・後腹膜膿瘍"/>
          </div>
          <div>
            <LabeledCheckbox v-model="AE.Title" value="子宮腔からの出血持続"/>
            <LabeledCheckbox v-model="AE.Title" value="子宮腔の癒着"/>
            <LabeledCheckbox v-model="AE.Title" value="卵管閉塞"/>
          </div>
        </div>
      </div>
      <div class="flex-content" v-if="showLocations">
        <div class="w20 subtitle">
          <span>発生部位</span>
        </div>
        <div class="w80 AEcheckboxes">
          <div>
            <LabeledCheckbox v-model="AE.Location" value="子宮"/>
            <LabeledCheckbox v-model="AE.Location" value="卵管"/>
            <LabeledCheckbox v-model="AE.Location" value="卵巣"/>
            <LabeledCheckbox v-model="AE.Location" value="腟"/>
          </div>
          <div>
            <LabeledCheckbox v-model="AE.Location" value="膀胱"/>
            <LabeledCheckbox v-model="AE.Location" value="尿管"/>
            <LabeledCheckbox v-model="AE.Location" value="後腹膜"/>
          </div>
          <div>
            <LabeledCheckbox v-model="AE.Location" value="消化管" />
          </div>
          <div>
            <LabeledCheckbox v-model="AE.Location" value="腹壁" />
            <LabeledCheckbox v-model="AE.Location" value="腹壁血管" />
            <LabeledCheckbox v-model="AE.Location" value="皮下" />
          </div>
          <div>
            <LabeledCheckbox v-model="AE.Location" value="動脈" />
            <LabeledCheckbox v-model="AE.Location" value="静脈" />
            <LabeledCheckbox v-model="AE.Location" value="大血管動脈" />
            <LabeledCheckbox v-model="AE.Location" value="大血管静脈" />
          </div>
          <div>
            <LabeledCheckbox v-model="AE.Location" value="神経" />
          </div>
          <div>
            <LabeledCheckbox v-model="AE.Location" value="上記にない部位" />
          </div>
        </div>
      </div>
      <div class="flex-content" v-if="showBleedings">
        <div class="w20 subtitle">
          <span>出血量</span>
        </div>
        <div class="w80 AEcheckboxes">
          <div>
            <input type="text" v-model="AE.BloodCount" :disabled="unknownBloodCounts" placeholder="出血量を入力してください"/> ml
          </div>
          <div>
            <LabeledCheckbox :container="unknownBloodCounts" @change="UnknownBleedCountsChanged">出血量不明</LabeledCheckbox>
          </div>
        </div>
      </div>
      <div class="flex-content"> <!-- Grade -->
        <div class="w20 subtitle">
          <span>合併症の程度</span>
        </div>
        <div class="w80">
          <select v-model="AE.Grade">
            <option value="" disabled style="display:none;">リストから選択</option>
            <option value="1">Grade 1: 正常な術後経過からの逸脱</option>
            <option value="2">Grade 2: 中等症 &nbsp; 輸血および中心静脈栄養を要する場合を含む</option>
            <option value="3a">Grade 3a: 全身麻酔を要さない治療介入を要する</option>
            <option value="3b">Grade 3b: 全身麻酔下での治療介入を要する</option>
            <option value="4">Grade 4: ICU管理を要する、合併症により生命を脅かす状態</option>
            <option value="5">Grade 5: 死亡</option>
          </select>
        </div>
      </div>
      <div class="flex-content"> <!-- Course -->
        <div class="w20 subtitle">
          <span>転帰</span>
        </div>
        <div class="w80">
          <div v-show="showByGrading(0)"><i class="el-icon-more" style="transform: rotate(90deg)"></i></div>
          <div ref="grade1" v-show="showByGrading(1)">
            <el-divider class="AEgrading-divider" content-position="left">Grade 1～2</el-divider>
            <div>
              <LabeledCheckbox v-model="AE.Course" value="経過観察">経過観察</LabeledCheckbox>
              <LabeledCheckbox v-model="AE.Course" value="周術期管理の延長">抗菌薬投与など周術期管理の延長</LabeledCheckbox>
              <LabeledCheckbox v-model="AE.Course" value="入院期間の延長">入院期間の延長</LabeledCheckbox>
              <LabeledCheckbox v-model="AE.Course" value="再入院">再入院</LabeledCheckbox>
            </div>
          </div>

          <div ref="grade2" v-show="showByGrading(2)">
            <el-divider class="AEgrading-divider" content-position="left">Grade 2</el-divider>
            <div>
              <LabeledCheckbox v-model="AE.Course" value="自己血輸血・術中回収血">輸血～自己血輸血・術中回収血</LabeledCheckbox>
              <LabeledCheckbox v-model="AE.Course" value="輸血・血液製剤">輸血・血液製剤</LabeledCheckbox>
            </div>
          </div>

          <div ref="grade3" v-show="showByGrading(3)">
            <el-divider class="AEgrading-divider" content-position="left">Grade 3</el-divider>
            <div style="margin: 0.3rem 0;"><span>術中の追加手術</span></div>
            <div>
              <LabeledCheckbox v-model="AE.Course" value="術中の追加手術～開腹">開腹</LabeledCheckbox>
              <LabeledCheckbox v-model="AE.Course" value="術中の追加手術～腹腔鏡">腹腔鏡</LabeledCheckbox>
              <LabeledCheckbox v-model="AE.Course" value="術中の追加手術～子宮鏡">子宮鏡</LabeledCheckbox>
              <LabeledCheckbox v-model="AE.Course" value="術中の追加手術～経腟">経腟</LabeledCheckbox>
              <LabeledCheckbox v-model="AE.Course" value="術中の追加手術～その他">その他</LabeledCheckbox>
            </div>
            <div style="margin: 0.3rem 0;"><span>術後の再手術</span></div>
            <div>
              <LabeledCheckbox v-model="AE.Course" value="術後の再手術～開腹">開腹</LabeledCheckbox>
              <LabeledCheckbox v-model="AE.Course" value="術後の再手術～腹腔鏡">腹腔鏡</LabeledCheckbox>
              <LabeledCheckbox v-model="AE.Course" value="術後の再手術～子宮鏡">子宮鏡</LabeledCheckbox>
              <LabeledCheckbox v-model="AE.Course" value="術後の再手術～経腟">経腟</LabeledCheckbox>
              <LabeledCheckbox v-model="AE.Course" value="術後の再手術～その他">その他,術後のIVRを含む再手術・追加処置</LabeledCheckbox>
            </div>
          </div>

          <div ref="grade4" v-show="showByGrading(4)">
            <el-divider class="AEgrading-divider" content-position="left">Grade 4</el-divider>
            <div>
              <LabeledCheckbox v-model="AE.Course" value="ICU管理">合併症管理のためのICU入室</LabeledCheckbox>
            </div>
          </div>

          <div ref="grade5" v-show="showByGrading(5)">
            <el-divider class="AEgrading-divider" content-position="left">Grade 5</el-divider>
            <div>
              <LabeledCheckbox v-model="AE.Course" value="死亡">死亡</LabeledCheckbox>
            </div>
          </div>
        </div>
      </div>

      <div class="content-bottom">
        <div class="controls">
          <el-button type="primary" @click="GoBack">取り消し</el-button>
          <el-button type="primary" @click="CommitChanges">登録</el-button>
        </div>
      </div>
    </EditSection>
  </TheWrapper>
</template>

<script>
import LabeledCheckbox from '@/components/Atoms/LabeledCheckbox'
import TheWrapper from '@/components/Atoms/TheWrapper'
import EditSection from '@/components/Molecules/EditSection'

import { ZenToHanNumbers } from '@/modules/ZenHanChars'
import * as Popups from '@/modules/Popups'

export default {
  components: {
    TheWrapper,
    EditSection,
    LabeledCheckbox
  },
  props: {
    ItemIndex: {
      type: Number,
      default: -1
    },
    ItemValue: {
      type: Object
    }
  },
  data () {
    return {
      Category: '',
      AE: {
        Title: [],
        Cause: [],
        Location: [],
        BloodCount: '',
        Grade: '',
        Course: []
      },
      unknownBloodCounts: false
    }
  },
  mounted () {
    this.$refs.firstelement.focus()
  },
  computed: {
    showBleedings () {
      return (this.Category === '出血')
    },
    showPerfusionRelated () {
      return (this.Category === '気腹・潅流操作')
    },
    showInjuriesCause () {
      return (
        (this.Category === '機器の不具合・破損') ||
        (this.Category === '機器の誤操作')
      )
    },
    showInjuriesTitle () {
      return (
        (this.Category === '術中手術操作') ||
        (this.Category === '機器の不具合・破損') ||
        (this.Category === '機器の誤操作')
      )
    },
    showDrugRelated () {
      return (this.Category === '術中使用した薬剤')
    },
    showRemnunts () {
      return (this.Category === '体腔内遺残')
    },
    showPostoperative () {
      return (this.Category === '術後')
    },
    showLocations () {
      return (
        (this.AE.Title.findIndex((s) => s === '臓器損傷') >= 0) ||
        (this.AE.Title.findIndex((s) => s === '出血') >= 0)
      )
    },
    showByGrading () {
      return value => {
        return this.AE.Grade ? Number(this.AE.Grade[0]) >= (value || undefined) : !value
      }
    }

  },
  methods: {
    CategoryChanged () {
      this.AE.Title.splice(0)
      this.AE.Cause.splice(0)
      this.AE.Location.splice(0)
      this.AE.BloodCount = ''
    },
    UnknownBleedCountsChanged (value) {
      if (value) {
        this.unknownBloodCounts = true
        this.AE.BloodCount = '不明'
      } else {
        this.unknownBloodCounts = false
        if (this.AE.BloodCount === '不明') {
          this.AE.BloodCount = ''
        }
      }
    },
    GoBack () {
      this.$router.replace('./')
    },
    async CommitChanges () {
      const $validateCatogory = () => {
        switch (this.Category) {
          case '出血':
            return (this.AE.BloodCount.trim() === '') ? false
              : /^(不明|([1-9]\d+|[5-9])\d{2})$/.test(this.AE.BloodCount)
          case '気腹・潅流操作':
          case '術後':
            return this.AE.Title.length
          case '術中使用した薬剤':
          case '体腔内遺残':
            return this.AE.Cause.length
          case '機器の不具合・破損':
          case '機器の誤操作':
            return this.AE.Cause.length &&
              (this.AE.Title.length ? (this.AE.Title.length && this.AE.Location.length) : true)
          case '術中手術操作':
            return this.AE.Title.length && this.AE.Location.length
        }
        return false
      }

      const $validateGrade = () => {
        if (this.AE.Grade && this.AE.Course.length > 0) {
          // 合併症は構造が複雑でマスタ化が困難なのでドキュメントの内容からチェック用マスタを生成する
          const worstcourses = Array.prototype.map.call(
            this.$refs['grade' + this.AE.Grade.substr(0, 1)]
              .getElementsByTagName('INPUT'),
            element => element.value
          )
          for (const course of this.AE.Course) {
            if (worstcourses.indexOf(course) !== -1) return true
          }
        }
        return false
      }

      if (this.AE.BloodCount !== '不明' && this.AE.BloodCount !== '') {
        this.AE.BloodCount = ZenToHanNumbers(this.AE.BloodCount.trim())
      }
      await this.$nextTick()

      if (!$validateCatogory()) {
        Popups.alert('登録内容が不十分です.')
        return
      }

      if (!$validateGrade()) {
        Popups.alert('合併症の程度(グレード)と転帰の内容に不整合があります.')
        return
      }

      const documentAEItem = { Category: this.Category }
      for (const key in this.AE) {
        if (this.AE[key] &&
          (Array.isArray(this.AE[key]) ? this.AE[key].length > 0 : true)) {
          documentAEItem[key] = this.AE[key]
        }
      }

      this.$emit('data-upsert', 'AEs', this.ItemIndex, documentAEItem)
      this.GoBack()
    }
  }
}
</script>

<style lang="sass">
div.AEcheckboxes
  div
    padding: 0.2rem 0 0
div.AEgrading-divider
  margin: 1.2rem 0
</style>

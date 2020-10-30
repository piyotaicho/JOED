<template>
  <div class="edititem-overlay">
    <div class="edititem-overlay-content">
      <div class="flex-content">
        <div class="w20 subtitle-section">
          <span>合併症の内容</span>
        </div>
        <div class="w80">
          <!-- <select :value="Category" @change="Category = $event.target.value, CategoryChanged()"> -->
          <select v-model="Category" @change="CategoryChanged()">
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
      <div class="flex-content" v-show="showPerfusionRelated">
        <div class="w20 subtitle-section">
          <span>発生した合併症</span>
        </div>
        <div class="w80">
          <div>
            <label>
              <input type="checkbox" v-model="AE.Title" value="皮下気腫"/>
              皮下気腫
            </label>
            <label>
              <input type="checkbox" v-model="AE.Title" value="ガス塞栓（炭酸ガス）"/>
              ガス塞栓（炭酸ガス）
            </label>
            <label>
              <input type="checkbox" v-model="AE.Title" value="ガス塞栓（空気）"/>
              ガス塞栓（空気）
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" v-model="AE.Title" value="水中毒"/>
              水中毒
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" v-model="AE.Title" value="そのほか心臓障害"/>
              そのほか心臓障害
            </label>
            <label>
              <input type="checkbox" v-model="AE.Title" value="そのほか呼吸器障害"/>
              そのほか呼吸器障害
            </label>
            <label>
              <input type="checkbox" v-model="AE.Title" value="そのほか神経系障害"/>
              そのほか神経系障害
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" v-model="AE.Title" value="上記以外"/>
              上記以外
            </label>
          </div>
        </div>
      </div>
      <div class="flex-content" v-show="showInjuriesCause">
        <div class="w20 subtitle-section">
          <span>関連する機器</span>
        </div>
        <div class="w80">
          <div>
            <label>
              <input type="checkbox" v-model="AE.Cause" value="鉗子"/>
              鉗子
            </label>
            <label>
              <input type="checkbox" v-model="AE.Cause" value="内視鏡"/>
              内視鏡(スコープ・シース)
            </label>
            <label>
              <input type="checkbox" v-model="AE.Cause" value="カテーテル"/>
              カテーテル・ガイドワイヤー
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" v-model="AE.Cause" value="内視鏡関連装置"/>
              内視鏡関連装置
            </label>
            <label>
              <input type="checkbox" v-model="AE.Cause" value="潅流気腹装置"/>
              潅流・気腹装置
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" v-model="AE.Cause" value="トロッカー"/>
              トロッカー
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" v-model="AE.Cause" value="子宮操作器具"/>
              子宮マニピュレーター・腟カップ・パイプ
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" v-model="AE.Cause" value="組織回収器具"/>
              組織回収器具（袋）・モルセレーター
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" v-model="AE.Cause" value="止血材料"/>
              血管クリップ・縫合糸
            </label>
            <label>
              <input type="checkbox" v-model="AE.Cause" value="ステープラー"/>
              自動縫合・吻合器
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" v-model="AE.Cause" value="電気メス"/>
              電気メス（モノポーラー・バイポーラー・アルゴンビーム）
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" v-model="AE.Cause" value="SUS"/>
              超音波凝固切開装置
            </label>
            <label>
              <input type="checkbox" v-model="AE.Cause" value="VSS"/>
              ベッセルシーリングシステム
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" v-model="AE.Cause" value="レーザー"/>
              レーザー
            </label>
            <label>
              <input type="checkbox" v-model="AE.Cause" value="マイクロ波"/>
              マイクロ波
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" v-model="AE.Cause" value="上記にないもの"/>
              上記にないもの
            </label>
          </div>
        </div>
      </div>
      <div class="flex-content" v-show="showInjuriesTitle">
        <div class="w20 subtitle-section">
          <span>発生した合併症</span>
        </div>
        <div class="w80">
          <div>
            <label>
              <input type="checkbox" v-model="AE.Title" value="臓器損傷" data-need_locations="T">
              臓器損傷
            </label>
            <label>
              <input type="checkbox" v-model="AE.Title" value="出血" data-need_locations="T">
              出血
            </label>
          </div>
        </div>
      </div>
      <div class="flex-content" v-show="showDrugRelated">
        <div class="w20 subtitle-section">
          <span>関連する薬剤</span>
        </div>
        <div class="w80">
          <div>
            <label>
              <input type="checkbox" v-model="AE.Cause" value="バソプレッシン">
              バソプレッシン
            </label>
            <label>
              <input type="checkbox" v-model="AE.Cause" value="アドレナリン">
              アドレナリン
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" v-model="AE.Cause" value="インジゴカルミン">
              インジゴカルミン
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" v-model="AE.Cause" value="上記にないもの">
              上記にないもの
            </label>
          </div>
        </div>
      </div>
      <div class="flex-content" v-show="showDrugRelated">
        <div class="w20 subtitle-section">
          <span>発生した合併症</span>
        </div>
        <div class="w80">
          <label>
            <input type="checkbox" v-model="AE.Title" value="アナフィラキシー">
            アナフィラキシー
          </label>
          <label>
            <input type="checkbox" v-model="AE.Title" value="心停止">
            心停止
          </label>
          <label>
            <input type="checkbox" v-model="AE.Title" value="洞性徐脈">
            洞性徐脈
          </label>
          <label>
            <input type="checkbox" v-model="AE.Title" value="それ以外">
            それ以外
          </label>
        </div>
      </div>
      <div class="flex-content" v-show="showRemnunts">
        <div class="w20 subtitle-section">
          <span>遺残したもの</span>
        </div>
        <div class="w80">
          <div>
            <label>
              <input type="checkbox" v-model="AE.Cause" value="検体">
              検体
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" v-model="AE.Cause" value="器械">
              器械
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" v-model="AE.Cause" value="ガーゼなど衛生材料">
              ガーゼなど衛生材料
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" v-model="AE.Cause" value="針">
              針
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" v-model="AE.Cause" value="上記にないもの">
              上記にないもの
            </label>
          </div>
        </div>
      </div>
      <div class="flex-content" v-show="showPostoperative">
        <div class="w20 subtitle-section">
          <span>合併症の内容</span>
        </div>
        <div class="w80">
          <div>
            <label>
              <input type="checkbox" v-model="AE.Title" value="出血" data-need_locations="T">
              出血
            </label>
            <label>
              <input type="checkbox" v-model="AE.Title" value="血腫" data-need_locations="T">
              血腫
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" v-model="AE.Title" value="創離開">
              創離開
            </label>
            <label>
              <input type="checkbox" v-model="AE.Title" value="創傷感染">
              創傷感染
            </label>
            <label>
              <input type="checkbox" v-model="AE.Title" value="腟断端部離開">
              腟断端部離開
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" v-model="AE.Title" value="腹膜炎">
              腹膜炎
            </label>
            <label>
              <input type="checkbox" v-model="AE.Title" value="子宮感染">
              子宮感染
            </label>
            <label>
              <input type="checkbox" v-model="AE.Title" value="卵管・卵巣感染">
              卵管・卵巣感染
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" v-model="AE.Title" value="麻痺性イレウス">
              麻痺性イレウス
            </label>
            <label>
              <input type="checkbox" v-model="AE.Title" value="絞扼性イレウス">
              絞扼性イレウス
            </label>
            <label>
              <input type="checkbox" v-model="AE.Title" value="消化管穿孔">
              消化管穿孔
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" v-model="AE.Title" value="腹壁瘢痕・ポートサイトヘルニア">
              腹壁瘢痕・ポートサイトヘルニア
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" v-model="AE.Title" value="尿管損傷">
              尿管損傷
            </label>
            <label>
              <input type="checkbox" v-model="AE.Title" value="尿路閉塞">
              尿路閉塞
            </label>
            <label>
              <input type="checkbox" v-model="AE.Title" value="膀胱損傷">
              膀胱損傷
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" v-model="AE.Title" value="肺動脈血栓塞栓症">
              肺動脈血栓塞栓症
            </label>
            <label>
              <input type="checkbox" v-model="AE.Title" value="深部静脈血栓症">
              深部静脈血栓症
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" v-model="AE.Title" value="気胸">
              気胸
            </label>
            <label>
              <input type="checkbox" v-model="AE.Title" value="心肺停止">
              心肺停止
            </label>
            <label>
              <input type="checkbox" v-model="AE.Title" value="コンパートメント症候群">
              コンパートメント症候群
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" v-model="AE.Title" value="上肢神経障害">
              上肢神経障害
            </label>
            <label>
              <input type="checkbox" v-model="AE.Title" value="下肢神経障害">
              下肢神経障害
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" v-model="AE.Title" value="リンパ浮腫">
              リンパ浮腫
            </label>
            <label>
              <input type="checkbox" v-model="AE.Title" value="非感染性リンパ嚢胞">
              非感染性リンパ嚢胞
            </label>
            <label>
              <input type="checkbox" v-model="AE.Title" value="感染性リンパ嚢胞・後腹膜膿瘍">
              感染性リンパ嚢胞・後腹膜膿瘍
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" v-model="AE.Title" value="子宮腔からの出血持続">
              子宮腔からの出血持続
            </label>
            <label>
              <input type="checkbox" v-model="AE.Title" value="子宮腔の癒着">
              子宮腔の癒着
            </label>
            <label>
              <input type="checkbox" v-model="AE.Title" value="卵管閉塞">
              卵管閉塞
            </label>
          </div>
        </div>
      </div>
      <div class="flex-content" v-show="showLocations">
        <div class="w20 subtitle-section">
          <span>発生部位</span>
        </div>
        <div class="w80">
          <div>
            <label>
              <input type="checkbox" v-model="AE.Location" value="子宮">
              子宮
            </label>
            <label>
              <input type="checkbox" v-model="AE.Location" value="卵管">
              卵管
            </label>
            <label>
              <input type="checkbox" v-model="AE.Location" value="卵巣">
              卵巣
            </label>
            <label>
              <input type="checkbox" v-model="AE.Location" value="腟">
              腟
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" v-model="AE.Location" value="膀胱">
              膀胱
            </label>
            <label>
              <input type="checkbox" v-model="AE.Location" value="尿管">
              尿管
            </label>
            <label>
              <input type="checkbox" v-model="AE.Location" value="後腹膜">
              後腹膜
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" v-model="AE.Location" value="消化管">
              消化管
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" v-model="AE.Location" value="腹壁">
              腹壁
            </label>
            <label>
              <input type="checkbox" v-model="AE.Location" value="腹壁血管">
              腹壁血管
            </label>
            <label>
              <input type="checkbox" v-model="AE.Location" value="皮下">
              皮下
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" v-model="AE.Location" value="動脈">
              動脈
            </label>
            <label>
              <input type="checkbox" v-model="AE.Location" value="静脈">
              静脈
            </label>
            <label>
              <input type="checkbox" v-model="AE.Location" value="大血管動脈">
              大血管動脈
            </label>
            <label>
              <input type="checkbox" v-model="AE.Location" value="大血管静脈">
              大血管静脈
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" v-model="AE.Location" value="神経">
              神経
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" v-model="AE.Location" value="上記にない部位">
              上記にない部位
            </label>
          </div>
        </div>
      </div>
      <div class="flex-content" v-show="showBleedings">
        <div class="w20 subtitle-section">
          <span>出血量</span>
        </div>
        <div class="w80">
          <div>
            <input type="text" v-model="AE.BloodCount" :disabled="unknownBloodCounts" placeholder="出血量を入力してください"/> ml
          </div>
          <div>
            <label>
              <input type="checkbox"
                :value="unknownBloodCounts"
                @change="UnknownBleedCountsChanged($event)"/>
              出血量不明
            </label>
          </div>
        </div>
      </div>
      <div class="flex-content"> <!-- Grade -->
        <div class="w20 subtitle-section">
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
        <div class="w20 subtitle-section">
          <span>転帰</span>
        </div>
        <div class="w80">
          <div v-show="showByGrading(0)"><i class="el-icon-more" style="transform: rotate(90deg)"></i></div>
          <div ref="grade1" v-show="showByGrading(1)">
            <el-divider class="AE" content-position="left">Grade 1～2</el-divider>
            <div>
              <label>
                <input type="checkbox" v-model="AE.Course" value="経過観察">
                経過観察
              </label>
              <label>
                <input type="checkbox" v-model="AE.Course" value="周術期管理の延長">
                抗菌薬投与など周術期管理の延長
              </label>
              <label>
                <input type="checkbox" v-model="AE.Course" value="入院期間の延長">
                入院期間の延長
              </label>
              <label>
                <input type="checkbox" v-model="AE.Course" value="再入院">
                再入院
              </label>
            </div>
          </div>

          <div ref="grade2" v-show="showByGrading(2)">
            <el-divider class="AE" content-position="left">Grade 2</el-divider>
            <div>
              <label>
                <input type="checkbox" v-model="AE.Course" value="自己血輸血・術中回収血">
                輸血～自己血輸血・術中回収血
              </label>
              <label>
                <input type="checkbox" v-model="AE.Course" value="輸血・血液製剤">
                輸血・血液製剤
              </label>
            </div>
          </div>

          <div ref="grade3" v-show="showByGrading(3)">
            <el-divider class="AE" content-position="left">Grade 3</el-divider>
            <div><span>術中の追加手術</span></div>
            <div>
              <label>
                <input type="checkbox" v-model="AE.Course" value="術中の追加手術～開腹">
                開腹
              </label>
              <label>
                <input type="checkbox" v-model="AE.Course" value="術中の追加手術～腹腔鏡">
                腹腔鏡
              </label>
              <label>
                <input type="checkbox" v-model="AE.Course" value="術中の追加手術～子宮鏡">
                子宮鏡
              </label>
              <label>
                <input type="checkbox" v-model="AE.Course" value="術中の追加手術～経腟">
                経腟
              </label>
              <label>
                <input type="checkbox" v-model="AE.Course" value="術中の追加手術～その他">
                その他
              </label>
            </div>
            <div><span>術後の再手術</span></div>
            <div>
              <label>
                <input type="checkbox" v-model="AE.Course" value="術後の再手術～開腹">
                開腹
              </label>
              <label>
                <input type="checkbox" v-model="AE.Course" value="術後の再手術～腹腔鏡">
                腹腔鏡
              </label>
              <label>
                <input type="checkbox" v-model="AE.Course" value="術後の再手術～子宮鏡">
                子宮鏡
              </label>
              <label>
                <input type="checkbox" v-model="AE.Course" value="術後の再手術～経腟">
                経腟
              </label>
              <label>
                <input type="checkbox" v-model="AE.Course" value="術後の再手術～その他">
                その他,術後のIVRを含む再手術・追加処置
              </label>
            </div>
          </div>

          <div ref="grade4" v-show="showByGrading(4)">
            <el-divider class="AE" content-position="left">Grade 4</el-divider>
            <div>
              <label>
                <input type="checkbox" v-model="AE.Course" value="合併症管理のためのICU入室">
                合併症管理のためのICU入室
              </label>
            </div>
          </div>

          <div ref="grade5" v-show="showByGrading(5)">
            <el-divider class="AE" content-position="left">Grade 5</el-divider>
            <div>
              <label>
                <input type="checkbox" v-model="AE.Course" value="死亡">
                死亡
              </label>
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
    </div>
  </div>
</template>

<script>
import { ZenToHanNumbers } from '@/modules/ZenHanChars'
import Popups from 'depmodules/Popups'

export default {
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
    UnknownBleedCountsChanged (event) {
      if (event.target.checked) {
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

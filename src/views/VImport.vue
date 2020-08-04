<template>
  <div style="width: 900px;">
    <div class="title-section">mergeファイルからのデータ読み込み</div>
    <el-button type="primary">ファイルの指定</el-button>
    <div>
      <el-button type="primary" @click="StartProcessing()">ファイルからのデータ入力の開始</el-button>
    </div>

    <el-collapse-transition>
      <div class="export-progression" v-if="ProcessingStep !== undefined">
        <el-steps :active="ProcessingStep" process-status="warning" finish-status="success" direction="vertical" space="42px">
          <el-step title="読み込みファイルのフォーマット確認">
            <span>このファイルは提出用データです, ダミーの患者IDなど一部のデータは自動生成されます.</span>
          </el-step>
          <el-step title="フィールドの変換">
            <span>ダミー患者IDの生成</span>
            <span>ダミー手術実施日の生成</span>
          </el-step>
          <el-step title="レコードの検証">
          </el-step>
          <el-step title="レコードの登録" />
        </el-steps>
      </div>
    </el-collapse-transition>

  </div>
</template>

<script>
export default {
  name: 'ViewImport'
}
</script>

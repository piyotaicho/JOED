
import ProcedureMaster from './src/modules/Masters/ProcedureMaster.js';
import fs from 'fs';

// ProcedureMasterのインスタンスを作成するために必要なダミーデータ
const treeData = { /* ... Treeオブジェクトの構造に合わせたデータ ... */ };
const riskData = { /* ... Riskオブジェクトの構造に合わせたデータ ... */ };
const year = '2025-07-08'; // ISO 8601形式の日付

try {
  // ProcedureMasterのインスタンスを作成
  const procedureMaster = new ProcedureMaster(treeData, riskData, year);

  // JSONに変換
  const jsonOutput = JSON.stringify(procedureMaster, null, 2);

  // ファイルに出力
  fs.writeFileSync('procedureMaster.json', jsonOutput);

  console.log('procedureMaster.jsonが正常に生成されました。');

} catch (error) {
  console.error('JSONの生成中にエラーが発生しました:', error);
}

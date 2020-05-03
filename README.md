# 合併症アンケートシステム JOED version.5

日本産科婦人科内視鏡学会の合併症アンケートシステムの最新版開発環境です。

## 構成

- vue cli + vuex + router
- nedb

追加パッケージ

- vuedraggable
- cross-plathome-YuGothic

### 試験環境

マイルストーンごとに公開予定：

https://p4testsuite.hostingerapp.com/JOEDv5/

- 2020-04-20 とりあえず、症例リストを作れるようになりましたので公開

データはブラウザのストレージに保存されます、そのうちストレージ削除やサンプルデータ読み込みのリンクも作成します。

# 仕様

### オブジェクト:提出データ
|名称                        |タイプ  |フォーマット規則|必須項目|エクスポート対象|解説|
|:--------------------------|:-----:|:------------:|:----:|:------------:|:--|
|InstitutionName            |string | |X|X|施設名テーブルから引用される|
|InstitutionID              |string | [0-9]{5} |X|X|施設名テーブルから引用される、未登録施設は99999？|
|ApplicationVersion         |string | |X|X|提出データ作成時のソフトウエアのバージョン|
|CreateDate                 |string | |X|X|提出データ作成日時|
|Year                       |string |20(19\|[23][0-9]) |X|X|提出データの年次|
|Data                       |array  | |X|X|症例データベースオブジェクト＝Cases|

### 症例データベースオブジェクト:Cases
|名称                        | タイプ |フォーマット規則|必須項目|エクスポート対象|解説|
|:--------------------------|:-----:|:--:|:--:|:--:|:--|
|_id                        |integer| | | |データベースエンジンが付与する内部管理id|
|SequentialId               |integer| |X| |連続番号|
|UniqueID                   |string |{{InstitutionID}}-{{Year}}-{{SequentialID}}|X|X|登録にあたっての症例番号<br/>（ユーザからは見えないが修正登録の際に問い合わせ番号として使用できるようにする）|
|ValidationReport           |string | | | |エラーチェックの結果、エラーの内容が入る|
|Name                       |string | |X|X|患者名|
|Age                        |integer| |X|X|年齢|
|InstitutionalPatientId     |string | |X| |施設での患者ID|
|JSOGId                     |string | | |X|日産婦腫瘍登録番号|
|NCDId                      |string | | |X|NCDのロボット登録患者番号（将来的にこちらからのデータ流し込みにNCDが対応したときに備える）|
|DateOfProcedure            |string |20(19\|[23][0-9])-(0[1-9]\|1[012])-([0-2][0-9]\|3[01])| |X|手術日<br/>InstitutionalPatientIDとDateOfProcedureでユニークが望ましいが確認のみとする|
|ProcedureTime              |string | |X|X|手術時間表記テーブルから引用される|
|TypeOfProcedure            |string |(腹腔鏡\|腹腔鏡悪性\|ロボット支援下\|ロボット支援下悪性\|子宮鏡\|卵管鏡)| | |主たる術式の種別、Procedures配列の最上位の順位のものが採用される|
|PresentAE                  |boolean| |X|X|合併症の登録があればtrue =(AE.length>0)|
|Diagnoses                  |array  | |X|X|診断オブジェクト - Diagnosis|
|Procedures                 |array  | |X|X|術式オブジェクト - Procedure|
|AEs                        |array  | | |X|合併症オブジェクト - AE|
|isError                    |string | | | |データチェックによるエラーの有無|
|Notification               |string | | | |データチェックによる確認内容（エラーを含む）の内容|

### オブジェクト:Diagnosis
提出データでは、Textにflattenされる.
インポートの際にはDiagnosisItemsから検索して適当なChainを割り付ける.
|名称                        |タイプ  |フォーマット規則|必須項目|エクスポート対象|解説|
|:--------------------------|:-----:|:--:|:--:|:--:|:--|
|Text                       |string | |X|X|診断名マスタから引用|
|Chain                      |array  | | | |選択ツリー[Category, Target]|

### オブジェクト:Procedure
提出データでは、TextとDescriptionだけのhashにflattenされる.
インポートの際にDiagnosisItemsから検索して適当なChainを割り付ける.
|名称                        |タイプ  |フォーマット規則|必須項目|エクスポート対象|解説|
|:--------------------------|:-----:|:--:|:--:|:--:|:--|
|Text                       |string | |X|X|術式名、術式マスタから引用|
|TypeOfProcedure            |string |(腹腔鏡\|腹腔鏡悪性\|ロボット支援下\|ロボット支援下悪性\|子宮鏡\|卵管鏡)| | |術式マスタから引用|
|AssociatedProcedures       |array  | | | |関連術式のProcedureオブジェクト|
|Description                |object | | |X|

### オブジェクト:AE
|名称                        |タイプ  |フォーマット規則|必須項目|エクスポート対象|解説|
|:--------------------------|:-----:|:--:|:--:|:--:|:--|
|Category                   |string | |X|X|合併症の発生カテゴリ|
|Title                      |string | |X|X|合併症の名称|
|Cause                      |string | | |X|合併症の原因|
|Location                   |string | | |X|合併症の発生部位|
|BloodCount                 |integer| | |X|出血の場合の出血量|
|Grade                      |string |([1245]\|3[ab])|X|X|合併症のグレード|
|Course                     |string | |X|X|合併症の転帰|

### マスタオブジェクト:InstituteList
|名称                        |タイプ  |解説
|:--------------------------|:-----:|:--|
|Name                       |string |施設名|
|Id                         |string |施設の登録番号<br/>数字５桁、未登録施設は99999？|
|Prefecture                 |string |県名|

### マスタ:DiagnosisMaster
|名称                        |タイプ  |解説
|:--------------------------|:-----:|:--|
|Diagnosis                  |string |診断名|
|ICD10                      |string |ICD-10コード(未実装)
|Location                   |array  |部位 ["子宮","卵巣","卵管","その他"]|
|Category                   |array  |関連手技 ["腹腔鏡","ロボット支援下","子宮鏡","卵管鏡"]|
|StartOfYearOfDataset       |integer|適用可能年開始|
|EndOfYearOfDataset         |integer|適用可能年終了<br/>これより後の年次ではこの病名はこの区分は無効かつ登録出来ない|

### オブジェクト:DiagnosisItems
DiagnosisMasterから作成される
```javascript
{
    'Category': {
        'Location': {
            'Diagnosis'
        }
    }
}
```

### マスタ:ProcedureMaster
|名称                        |タイプ  |解説
|:--------------------------|:-----:|:--|
|Procedure                  |string |手技名|
|Target                     |array  |部位 ["子宮","卵巣","卵管","その他"]|
|TypeOfProcedure            |array  |関連手技 []|
|Category                   |array  |良悪性分類 ["腹腔鏡","腹腔鏡悪性","ロボット","ロボット悪性","子宮鏡","卵管鏡"]|
|StartOfYearOfDataset       |integer|適用可能年開始|
|EndOfYearOfDataset         |integer|適用可能年終了<br/>これより後の年次ではこの術式はこの区分は無効かつ登録出来ない|
|Ditto                      |array  |同時に入力できない同一手技に相当する手技名|
|AdditionalProcedure        |string |同時に展開を行う関連術式|
|DescriptionTitle           |string |補助情報の見出し<br/>$で終了するタイトル名は補助情報を複数保持できる|
|Descriptions               |array  |補助情報の候補|

### オブジェクト:DiagnosisItems
ProcedureMasterから作成される
```javascript
{
    'Category': {
        'Location': {
            'Procedure',
            {
                'Procedure': {
                    Ditto: [],
                    AdditionalProcedure: [...AdditionalProcedure],
                    Description: {
                        DescriptionTitle: [...Descriptions]
                    }
                }
            }
        }
    }
}
```

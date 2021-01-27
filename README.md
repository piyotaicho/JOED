# 合併症アンケートシステム JOED version.5

日本産科婦人科内視鏡学会の合併症アンケートシステムの最新版開発環境です。

## 構成

- vue2 (cli 3) + vuex + router
- electron

追加パッケージ

- nedb
- Element
- Vue.Draggable
- Vuejs Datepicker
- Vue infinite loading
- js-xxhash
- Difflib.js
- encoding.js
- electron store

## 配布

- Windows x64, Windows 32bit(非推奨), macos(ia64) ～ <a href="https://github.com/piyotaicho/JOED/releases">Releases</a>よりご利用ください.
- webアプリ(非推奨) https://p4testsuite.hostingerapp.com/JOEDv5/Release/web/

### アプリケーション版での注意事項
Windowsではデータをユーザのデータフォルダに格納するのでインストールもユーザフォルダとなります. 現時点ではスタートメニュー内のアイコン右クリックで表示されるアンインストールではアンインストール出来ません.
データベースの削除は, Windowsでは %AppData%¥JOED5¥joed.nedb* , macosでは ~/Library/ApplicationSupport/JOED5/joed.nedb* で可能です. コマンドラインから実行できる場合は JOED5 --drop-database[=all] でデータベースファイルを削除できます.

### Webアプリ使用にあたっての注意事項
Webアプリの動作は動作検証もアプリ版より遅れますまた, Google Chrome以外では担保できません.
また動作自体も完全には保証できずキーボードショートカットなどについては動作しないものもありますのでご了承ください.
データベースはブラウザのローカルDBに保存されます.データベースの削除・修正などは https://p4testsuite.hostingerapp.com/JOEDv5/Database_Manager/ のユーティリティを使用してください.

## 変更履歴
- 2021-01-27 [Version1.1] JSONでのデータベースインポートを実装.
- 2021-01-26 [Version1.1] generic CSVのインポートを実装.
- 2021-01-08 重複入力チェックの不具合を解消, エクスポート時に重複入力チェックを実装. エラーメッセージ中で改行出来るように機能強化.
- 2021-01-05 診断・術式の表記変更については自動置換するように仕様追加. (カテゴリをまたぐ変換は影響が大きいので見送り)
- 2020-12-30 [macos] コピーアンドペーストのため, 編集メニューを設置.
- 2020-11-29 表示に修正を加えて, githubのリリース(v1.0.333)を作成.
- 2020-11-28 リリースビルドを公開 1.0.331
<br/><a href="Changelog.md">Changelog</a>

## データの仕様

### 提出データ
JSONでエクスポートされる.

```
[
    { 提出データヘッダ },
    { 症例データ1 },
    { 症例データ2 },
    ...
    { 症例データn }
]
```
Validationは診断・実施術式・合併症のマスタを参照するので結構コストが掛かるため、そこは提出を受け付けてから行う.大まかな整合性チェックはすべて症例入力の際に行われている.
(データインポートのため整合性チェックのルーチンは必要だが、それは別アプリケーションでもよいかもしれない)

### オブジェクト:提出データヘッダ
|名称                        |タイプ  |フォーマット規則|解説|
|:--------------------------|:-----:|:---------:|:--|
|InstitutionName            |string | |施設名テーブルから引用される|
|InstitutionID              |string |\d{5}|施設名テーブルから引用される、未登録施設は学会に申請して番号交付を受ける|
|JSOGoncologyboardID        |string | |日産婦の腫瘍登録施設番号
|Timestump                  |integer | |提出データ作成日時のUNIX timestump|
|Year                       |string |20(19\|[23][0-9])|提出データの年次|
|NumberOfCases              |integer| |Casesの数（サードパーティーからの書き出しに対するエラーチェック用）|
|Version                    |string | |提出データ作成時のソフトウエアのバージョン|
|Plathome                   |string | |使用環境調査 plathome (arch)|
|hash                       |string | |症例データ部分だけのハッシュ値|

### 症例データベースオブジェクト:Case
|名称                        | タイプ |フォーマット規則|必須項目|エクスポート対象|解説|
|:--------------------------|:-----:|:--:|:--:|:--:|:--|
|_id                        |integer| | | |データベースエンジンが付与する内部管理id|
|DocumentId                 |integer| |X| |連続番号|
|hash                       |string | |x|X|DocumentIdのハッシュ値(提出データにのみ付加)|
|Name                       |string | | | |患者名|
|Age                        |integer| |X| |年齢|
|PatientId                  |string | |X| |施設での患者ID|
|JSOGId                     |string | | |X|日産婦腫瘍登録番号|
|NCDId                      |string |\d{18}-\d{2}-\d{2}-\d{2}| |X|NCD症例識別コード～ロボット登録にけるNCD側の患者番号（将来的にこちらからのデータ流し込みにNCDが対応したときに備える）|
|DateOfProcedure            |string |20(19\|[23][0-9])-(0[1-9]\|1[012])-([0-2][0-9]\|3[01])|X||手術日<br/>InstitutionalPatientIDとDateOfProcedureでユニークが望ましいが確認のみとする|
|ProcedureTime              |string | |X|X|手術時間表記テーブルから引用される|
|TypeOfProcedure            |string |(腹腔鏡\|腹腔鏡悪性\|ロボット支援下\|ロボット支援下悪性\|子宮鏡\|卵管鏡)|X|X|主たる術式の種別、Procedures配列の最上位の順位のものが採用される|
|PresentAE                  |boolean| |X|X|合併症の登録があればtrue =(AE.length>0)|
|Diagnoses                  |array  | |X|X|診断オブジェクト - Diagnosis|
|Procedures                 |array  | |X|X|術式オブジェクト - Procedure|
|AEs                        |array  | | |X|合併症オブジェクト - AE|
|Imported                   |boolean| | | |読み込まれたデータ
|Notification               |string | | | |データチェックによる確認内容（エラーを含む）の内容(主にインポートされたデータ用)|

### オブジェクト:Diagnosis
提出データでは、Textにflattenされる.
インポートの際にはDiagnosisItemsから検索して適当なChainを割り付ける.
|名称                        |タイプ  |フォーマット規則|必須項目|エクスポート対象|解説|
|:--------------------------|:-----:|:--:|:--:|:--:|:--|
|Text                       |string | |X|X|診断名マスタから引用|
|Chain                      |array  | | | |選択ツリー[Category, Target]|
|Description                |string | | |X|補足情報(将来の拡張用)|
|UserTyped                  |boolean| | |X|手入力情報|

### オブジェクト:Procedure
提出データでは、TextとDescriptionだけのhashにflattenされる.
インポートの際にDiagnosisItemsから検索して適当なChainを割り付ける.
|名称                        |タイプ  |フォーマット規則|必須項目|エクスポート対象|解説|
|:--------------------------|:-----:|:--:|:--:|:--:|:--|
|Text                       |string | |X|X|術式名、術式マスタから引用
|Chain                      |array  | | | |選択ツリー[Category, Target]
|Description                |array  | | |x|付随情報
|AdditionalProcedure        |object | | |x|併施術式 - これも同じ構造を取る
|Ditto                      |array  | | | |重複確認の対象となる術式名
|UserTyped                  |boolean| | |X|手入力情報|

### オブジェクト:AE
|名称                        |タイプ  |フォーマット規則|必須項目|エクスポート対象|解説|
|:--------------------------|:-----:|:--:|:--:|:--:|:--|
|Category                   |string | |X|X|合併症の発生カテゴリ
|Title                      |string | |X|X|合併症の名称
|Cause                      |array  | | |X|合併症の原因
|Location                   |array  | | |X|合併症の発生部位
|BloodCount                 |string | | |X|出血の場合の出血量 もしくは '不明'
|Grade                      |string |([1245]\|3[ab])|X|X|合併症のグレード
|Course                     |array  | |X|X|合併症の転帰

### マスタオブジェクト:InstituteList
|名称                        |タイプ  |解説
|:--------------------------|:-----:|:--|
|Name                       |string |施設名
|Id                         |string |施設の登録番号<br/>数字５桁、未登録施設は99999？
|Prefecture                 |string |県名

### マスタ:DiagnosisMaster
|名称                        |タイプ  |解説
|:--------------------------|:-----:|:--|
|Diagnosis                  |string |診断名|
|ICD10                      |string |ICD-10コード|
|Category                   |array  |関連手技 ["腹腔鏡","ロボット支援下","子宮鏡","卵管鏡"]|
|Target                     |array  |部位 ["子宮","付属器","その他"]|
|Notification               |string |入力時に表示されるおしらせ(未実装)|
|Procedure                  |string |1:1で紐付けられた術式(未実装)|
|VaildFrom                  |integer|適用可能年開始|
|VaildTo                    |integer|適用可能年終了<br/>これより後の年次ではこの病名は無効かつ登録出来ない|

### オブジェクト:DiagnosisItems
DiagnosisMasterから作成される
```javascript
{
    'Category': {
        'Target': {
            'Diagnosis'
        }
    }
}
```

### マスタ:ProcedureMaster
|名称                        |タイプ  |解説
|:--------------------------|:-----:|:--|
|Procedure                  |string |手技名|
|STEM7                      |string |STEM7コード(未実装)|
|Kcode|string|対応する社保Kコード(Kxxx-0x-0x形式)|
|Category                   |array  |良悪性分類 ["腹腔鏡","腹腔鏡悪性","ロボット","ロボット悪性","子宮鏡","卵管鏡"]|
|Target                     |array  |部位 ["子宮","付属器","その他"]|
|VaildFrom                  |string |適用可能年開始|
|VaildTo                    |string |適用可能年終了<br/>これより後の年次ではこの術式はこの区分は無効かつ登録出来ない|
|Ditto                      |array  |同時に入力できない同一手技に相当する手技名|
|AdditionalProcedure        |string |同時に展開を行う関連術式<br/>基本的には同一の選択チェーン内にある|
|DescriptionTitle           |string |補助情報の見出し|
|Descriptions               |array  |補助情報の候補<br/>$MULTI$をメンバにもつ場合複数の内容を保持できる|

### オブジェクト:DiagnosisItems
ProcedureMasterから作成される
```javascript
{
    'Category': {
        'Target': {
            'Procedure', // なにも付随情報が無い場合
            {
                Text: 'Procedure',
                Ditto: [...],
                AdditionalProcedure: 'AdditionalProcedure',
                Description: {
                    Text: 'Titie',
                    Values: [...selections]
                    // selectionsに$MULTI$を含む場合は複数選択可能
                    // $で終了する項目を選択した場合はこのエントリ自体が生成されない(=単独作成不可)
                }
            }
        }
    }
}
```

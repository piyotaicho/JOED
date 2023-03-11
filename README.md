# 合併症アンケートシステム JOED version.5

日本産科婦人科内視鏡学会の合併症アンケートシステムの最新版開発環境です.

## 構成

- vue2 + vuex + router
- electron

追加パッケージ

- nedb (seald/nedb)
- Element
- Vue.Draggable
- Vuejs Datepicker
- Vue infinite loading
- js-xxhash
- Difflib.js
- encoding.js
- electron store

## 配布
リリースから最新版バイナリをダウンロードしてください.

### アプリケーション版での注意事項
Windowsではデータをユーザのデータフォルダに格納するのでインストールもユーザフォルダとなります. アンインストールはコントロールパネル(Windows7～10)、スタートメニュー内のアイコン右クリックで表示されるアンインストール(Windows10～11)で可能です.  
データベースの削除は, Windowsでは %AppData%¥JOED5¥joed.nedb* , macosでは ~/Library/ApplicationSupport/JOED5/joed.nedb* で可能です.
設定やその他のファイルも削除したい場合は当該フォルダを削除して下さい.

### コマンドラインオプション
#### --datadir=ディレクトリ
データベースの保存ディレクトリをフルパスで指定. このオプションを使用した場合はロックファイルを作成し, 同時にアクセス可能なのは1台に限られます.
共有フォルダなどを指定することが出来ますが, データベースへの複数インスタンスからの同時アクセスはできません.

#### --unlock
--datadirオプション使用中に発生したデータベースへのロックを解除.

#### --config=パス
アプリケーションの設定ファイルもしくは, 設定ファイルを保存するディレクトリを指定します. ディレクトリを指定した場合のファイル名はconfig.jsonです.

#### --drop-database[=all|lock]
データベースの削除.
allでバックアップも削除.
lockでは何らかの原因でロックがかかったままになった場合, ロックファイルを削除してロックを解除.(--unlockに移動)

## 変更履歴
- 2023-03-12 手術時間validationの修正に伴うインポート不具合.
- 2023-02-07 Windowsインストーラでネットワークドライブへの制限付きインストールを実装(セキュリティ面で問題があり非推奨). コマンドラインオプション使用中の初期化エラーへのハンドリング対応.
- 2023-02-03 コマンドラインオプションエラーのハンドリングを安全に修正.
- 2023-01-20 JSONインポートの不具合を修正. UPDATEの誤修正を修正. ネットワークドライブへのインストールに警告.
- 2023-01-18 backgroundの起動プロセスを整理, unhandled promise例外へ対処.
- 2023-01-14 上書きインストールにおいて動作不良となり得る不具合に対処. macでのフォント展開不良に伴いインポートのUIを一部変更, 登録エラーの保存を可能に. ビルド1109に更新.
- 2022-12-23 日付validationを修正. ビルド1087 に更新.
- 2022-12-15 各種モジュールの設計をrefine. 動作確認. ReleaseのためmasterへPR. v1.3.1079リリース, Windows 32bitは未検証.
- 2022-12-12 xxhashjsまわりの実装をライブラリの性質にあわせて修正.
- 2022-12-10 Windows11のアプリケーションの取扱に対応(右クリックアンインストール可能に). Electronを21.3.3へ. UIを少しだけ修正.
- 2022-11-27 Electronを21系列最新に更新とそれに伴う修正. COPYRIGHTをpackagejsonから取得. データベースインターフェースを簡素化.
- 2022-11-26 開発パッケージを更新. それに伴う機能面に反映されない修正.
- 2022-11-25 Electronを20系列最新(20.3.7)に更新. Hash検索できないバグ修正.
- 2022-11-24 細かい修正. 施設マスタを2022-11-22時点の情報にアップデート. エクスポートを2022仕様に. 
- 2022-11-23 Electron update to 13.
- 2022-11-17 Merge update.
- 2022-10-26 vue2のパッケージなどを更新.
- 2022-10-25 エクスポートの構成を若干変更, 全てバックアップを選択可能に.
- 2022-08-26 データベースエンジンを変更.
- 2022-08-25 ロボット手術のカテゴリ分けの失敗を修正.
- 2022-05-30 実施手術の付随情報エラー処理を修正.
- 2022-05-26 [Version1.3] v1.3.876リリース. Windows 32bitへの対応は行わないこととしました.
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
|hash                       |string | |x|X|レコードのユニークキーであるPatientIdとDateOfProcedureのハッシュ値(提出データにのみ付加)|
|Name                       |string | | | |患者名|
|Age                        |integer| |X| |年齢|
|PatientId                  |string | |X| |施設での患者ID|
|JSOGId                     |string | | | |日産婦腫瘍登録番号|
|NCDId                      |string |\d{18}-\d{2}-\d{2}-\d{2}| | |NCD症例識別コード～ロボット登録にけるNCD側の患者番号（将来的にこちらからのデータ流し込みにNCDが対応したときに備える）|
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
|Chain                      |array  | | | |選択ツリー[category, Target]|
|Description                |string | | |X|補足情報(将来の拡張用)|
|UserTyped                  |boolean| | |X|手入力情報|

### オブジェクト:Procedure
提出データでは、TextとDescriptionだけのhashにflattenされる.
インポートの際にDiagnosisItemsから検索して適当なChainを割り付ける.
|名称                        |タイプ  |フォーマット規則|必須項目|エクスポート対象|解説|
|:--------------------------|:-----:|:--:|:--:|:--:|:--|
|Text                       |string | |X|X|術式名、術式マスタから引用
|Chain                      |array  | | | |選択ツリー[category, Target]
|Description                |array  | | |x|付随情報
|AdditionalProcedure        |object | | |x|併施術式 - これも同じ構造を取る
|Ditto                      |array  | | | |重複確認の対象となる術式名
|UserTyped                  |boolean| | |X|手入力情報|

### オブジェクト:AE
|名称                        |タイプ  |フォーマット規則|必須項目|エクスポート対象|解説|
|:--------------------------|:-----:|:--:|:--:|:--:|:--|
|category                   |string | |X|X|合併症の発生カテゴリ
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
|category                   |array  |関連手技 ["腹腔鏡","ロボット支援下","子宮鏡","卵管鏡"]|
|Target                     |array  |部位 ["子宮","付属器","その他"]|
|Notification               |string |入力時に表示されるおしらせ(未実装)|
|Procedure                  |string |1:1で紐付けられた術式(未実装)|
|ValidFrom                  |integer|適用可能年開始|
|ValidTo                    |integer|適用可能年終了<br/>これより後の年次ではこの病名は無効かつ登録出来ない|

### オブジェクト:DiagnosisItems
DiagnosisMasterから作成される
```javascript
{
    'category': {
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
|category                   |array  |良悪性分類 ["腹腔鏡","腹腔鏡悪性","ロボット","ロボット悪性","子宮鏡","卵管鏡"]|
|Target                     |array  |部位 ["子宮","付属器","その他"]|
|ValidFrom                  |string |適用可能年開始|
|ValidTo                    |string |適用可能年終了<br/>これより後の年次ではこの術式はこの区分は無効かつ登録出来ない|
|Ditto                      |array  |同時に入力できない同一手技に相当する手技名|
|AdditionalProcedure        |string |同時に展開を行う関連術式<br/>基本的には同一の選択チェーン内にある|
|DescriptionTitle           |string |補助情報の見出し|
|Descriptions               |array  |補助情報の候補<br/>$MULTI$をメンバにもつ場合複数の内容を保持できる|

### オブジェクト:DiagnosisItems
ProcedureMasterから作成される
```javascript
{
    'category': {
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

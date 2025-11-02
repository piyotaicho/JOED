# as Japanese language definition
!ifndef JOEDINSTALLER
  !define JOEDINSTALLER true

  !ifdef APP_32
    !define ARCH "-ia32"
  !endif
  !ifdef APP_64
    !define /ifndef ARCH ""
  !endif
  !ifndef ARCH
    !error "ARCHITECTURE SHOULD BE IA32 OR X64"
  !endif

  !define JOEDAPPNAME "症例登録システム"
  !define INSTALLERCAPTION "日本産科婦人科内視鏡学会 症例登録システム"
  !define JOEDPUBLISHER "日本産科婦人科内視鏡学会"

  !define INSTALL_WELCOMEPAGE_TITLE "症例登録システムのセットアップへようこそ"

  !define INSTALL_FINISHPAGE_TITLE "症例登録システムのセットアップは完了しました"
  !define INSTALL_FINISHPAGE_RUN_TEXT "症例登録システムを起動する"

  !define /ifndef DRIVE_REMOVABLE 3
  !define /ifndef DRIVE_FIXED 3
  !define /ifndef DRIVE_REMOTE 4
  !define INSTALL_NETWORKDRIVE_ALERT "ネットワーク共有ドライブへのインストールはセキュリティ上推奨できません.$\r$\n上記を了承の上オプションの設定をしてインストールを継続しますか?"

  !define UNINSTALL_TEXT_TOP "症例登録システムのプログラムをシステムから削除します."
  !define UNINSTALL_FINISHPAGE_TITLE "症例登録システムを削除しました"
  !define UNINSTALL_FINISHPAGE_TEXT "ご協力ありがとうございました."
  !define UNINSTALL_FINISHPAGE_RUN_TEXT "設定とデータファイルも削除する場合はチェックしてください."
  !define REMOVE_DATA_FINAL_CONFIRM "設定とデータファイルを削除します, よろしいですか？"

#  !define MENUDIRNAME "$SMPROGRAMS\日本産科婦人科内視鏡学会"
#  !define MENUITEM1NAME "$SMPROGRAMS\日本産科婦人科内視鏡学会\症例登録システム.lnk"
#  !define MENUITEM2OLDNAME "$SMPROGRAMS\日本産科婦人科内視鏡学会\アンインストール.lnk"
#  !define MENUITEM2NAME "$SMPROGRAMS\日本産科婦人科内視鏡学会\症例登録アンインストール.lnk"

  !define MSG_MSGBOX "設定とデータファイル等を削除しました."
!endif

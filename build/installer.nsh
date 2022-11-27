# language
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

  !define INSTALL_WELCOMEPAGE_TITLE "症例登録システムのセットアップへようこそ"
  !define INSTALL_FINISHPAGE_TITLE "症例登録システムのセットアップは完了しました"
  !define INSTALL_FINISHPAGE_RUN_TEXT "症例登録システムを起動する"

  !define UNINSTALL_TEXT_TOP "症例登録システムのプログラムをシステムから削除します."
  !define UNINSTALL_FINISHPAGE_TITLE "症例登録システムを削除しました"
  !define UNINSTALL_FINISHPAGE_TEXT "ご協力ありがとうございました."
  !define UNINSTALL_FINISHPAGE_RUN_TEXT "設定とデータファイルも削除する場合はチェックしてください."

  !define MENUDIRNAME "$SMPROGRAMS\日本産科婦人科内視鏡学会"
  !define MENUITEM1NAME "$SMPROGRAMS\日本産科婦人科内視鏡学会\症例登録システム.lnk"
  !define MENUITEM2NAME "$SMPROGRAMS\日本産科婦人科内視鏡学会\アンインストール.lnk"

  !define MSG_MSGBOX "設定とデータファイル等を削除しました."
!endif

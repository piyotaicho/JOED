# Unicode
Unicode true
!include MUI2.nsh

Name "症例登録システム"
Caption "日本産科婦人科内視鏡学会 症例登録システム"
OutFile "JOED5-installer.exe"
SetCompressor lzma

InstallDir "$LOCALAPPDATA\Programs\JOED5"

RequestExecutionLevel user
ShowInstDetails show
ShowUnInstDetails show

!define MUI_WELCOMEPAGE_TITLE "症例登録システムのセットアップへようこそ"
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "build/license.txt"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!define MUI_FINISHPAGE_TITLE "症例登録システムのセットアップは完了しました"
!define MUI_FINISHPAGE_RUN "$INSTDIR\JOED5.exe"
!define MUI_FINISHPAGE_RUN_TEXT "症例登録システムを起動する"
!insertmacro MUI_PAGE_FINISH

!define MUI_UNCONFIRMPAGE_TEXT_TOP "症例登録システムのプログラムをシステムから削除します."
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!define MUI_FINISHPAGE_TITLE "症例登録システムを削除しました"
!define MUI_FINISHPAGE_TEXT "ご協力ありがとうございました."
!define MUI_FINISHPAGE_RUN
!define MUI_FINISHPAGE_RUN_TEXT "設定とデータファイルも削除する場合はチェックしてください."
!define MUI_FINISHPAGE_RUN_NOTCHECKED
!define MUI_FINISHPAGE_RUN_FUNCTION un.DeleteDataFolder
!insertmacro MUI_UNPAGE_FINISH

!define MUI_NOLEFTIMAGE

!insertmacro MUI_LANGUAGE "Japanese"

Section 
    SetOutPath "$INSTDIR"
    # 64bit
    File /r "dist_electron/win-unpacked\*.*"
    # 32bit
    #File /r "dist_electron/win-ia32-unpacked\*.*"

    # アンインストーラの準備
    WriteUninstaller "$INSTDIR\Uninstall.exe"

    # スタートメニュー
    CreateDirectory "$SMPROGRAMS\日本産科婦人科内視鏡学会"
    CreateShortCut "$SMPROGRAMS\日本産科婦人科内視鏡学会\症例登録システム.lnk" "$INSTDIR\JOED5.exe" ""
    CreateShortCut "$SMPROGRAMS\日本産科婦人科内視鏡学会\アンインストール.lnk" "$INSTDIR\Uninstall.exe" ""
    # WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\JOED5" "DisplayName" "日本産科婦人科内視鏡学会"
    # WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\JOED5" "UninstallString" '"$INSTDIR\Uninstall.exe"'
SectionEnd

Section "Uninstall" 
    # DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\JOED5"
    DELETE "$SMPROGRAMS\日本産科婦人科内視鏡学会\症例登録システム.lnk"
    DELETE "$SMPROGRAMS\日本産科婦人科内視鏡学会\アンインストール.lnk"
    RMDIR "$SMPROGRAMS\日本産科婦人科内視鏡学会"
    Delete "$INSTDIR\Uninstall.exe"
    RMDIR /r "$INSTDIR"
SectionEnd

Function un.DeleteDataFolder
    RMDIR /r "$APPDATA\JOED5"
    MessageBox MB_ICONINFORMATION|MB_OK "設定とデータファイル等を削除しました."
FunctionEnd

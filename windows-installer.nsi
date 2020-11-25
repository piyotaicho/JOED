# Unicode
Unicode true
# モダンUIを使用
!include MUI2.nsh

Name "症例登録システム"
Caption "日本産科婦人科内視鏡学会 症例登録システム"
OutFile "JOED5-installer.exe"
SetCompressor lzma

InstallDir "$LOCALAPPDATA\Programs\JOED5"

RequestExecutionLevel user
ShowInstDetails show
ShowUnInstDetails show

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "build/license.txt"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_LANGUAGE "Japanese"

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

!define MUI_NOLEFTIMAGE

LangString MUI_UNTEXT_CONFIRM_SUBTITLE 0 "症例登録システムのプログラムをシステムから削除します. システム設定とデータファイルは削除されません."
LangString MUI_UNTEXT_UNINSTALLING_TITLE 0 "症例登録システムを削除しています."
LangString MUI_UNTEXT_CONFIRM_TITLE 0 "症例登録システムのアンインストール"
LangString MUI_UNTEXT_FINISH_TITLE 0 "症例登録システムを削除しました"
LangString MUI_UNTEXT_FINISH_SUBTITLE 0 "症例登録システムのプログラムを削除しました. ご協力ありがとうございました."

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
    # レジストリに登録
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


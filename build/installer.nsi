# Unicode
Unicode true
!include MUI2.nsh

!ifdef JOEDINSTALLER
    Name "${JOEDAPPNAME}"
    Caption "${INSTALLERCAPTION}"
    SetCompressor lzma

    InstallDir "$LOCALAPPDATA\Programs\JOED5"

    RequestExecutionLevel user
    ShowInstDetails show
    ShowUnInstDetails show

    !define MUI_WELCOMEPAGE_TITLE "${INSTALL_WELCOMEPAGE_TITLE}"
    !insertmacro MUI_PAGE_WELCOME
    !insertmacro MUI_PAGE_LICENSE "${BUILD_RESOURCES_DIR}\license.txt"
    !insertmacro MUI_PAGE_DIRECTORY
    !insertmacro MUI_PAGE_INSTFILES
    !define MUI_FINISHPAGE_TITLE "${INSTALL_FINISHPAGE_TITLE}"
    !define MUI_FINISHPAGE_RUN "$INSTDIR\JOED5.exe"
    !define MUI_FINISHPAGE_RUN_TEXT "${INSTALL_FINISHPAGE_RUN_TEXT}"
    !insertmacro MUI_PAGE_FINISH

    !define MUI_UNCONFIRMPAGE_TEXT_TOP "${UNINSTALL_TEXT_TOP}"
    !insertmacro MUI_UNPAGE_CONFIRM
    !insertmacro MUI_UNPAGE_INSTFILES
    !define MUI_FINISHPAGE_TITLE "${UNINSTALL_FINISHPAGE_TITLE}"
    !define MUI_FINISHPAGE_TEXT "${UNINSTALL_FINISHPAGE_TEXT}"
    !define MUI_FINISHPAGE_RUN
    !define MUI_FINISHPAGE_RUN_TEXT "${UNINSTALL_FINISHPAGE_RUN_TEXT}"
    !define MUI_FINISHPAGE_RUN_NOTCHECKED
    !define MUI_FINISHPAGE_RUN_FUNCTION un.DeleteDataFolder
    !insertmacro MUI_UNPAGE_FINISH

    !define MUI_NOLEFTIMAGE

    !insertmacro MUI_LANGUAGE "Japanese"

    Section 
        SetOutPath "$INSTDIR"
        File /r "${PROJECT_DIR}\dist_electron\win${ARCH}-unpacked\*.*"

        # prepare uninstaller
        WriteUninstaller "$INSTDIR\Uninstall.exe"

        # start menu
        CreateDirectory "${MENUDIRNAME}"
        CreateShortCut "${MENUITEM1NAME}" "$INSTDIR\JOED5.exe" ""
        CreateShortCut "${MENUITEM2NAME}" "$INSTDIR\Uninstall.exe" ""
    SectionEnd

    Section "Uninstall" 
        DELETE "${MENUITEM1NAME}"
        DELETE "${MENUITEM2NAME}"
        RMDIR "${MENUDIRNAME}"
        Delete "$INSTDIR\Uninstall.exe"
        RMDIR /r "$INSTDIR"
    SectionEnd

    Function un.DeleteDataFolder
        RMDIR /r "$APPDATA\JOED5"
        MessageBox MB_ICONINFORMATION|MB_OK "${MSG_MSGBOX}"
    FunctionEnd
!else
    !error "JOEDINSTALLER not defined."
!endif

# NSIS installer configuration for JOED5
# - require installer.nsh to define Japanese messages.
Unicode true
!include MUI2.nsh

!ifdef JOEDINSTALLER
    Name "${JOEDAPPNAME}"
    Caption "${INSTALLERCAPTION}"

    SetCompressor lzma

    InstallDir "$LOCALAPPDATA\Programs\JOED5"

    Var /Global NO_SANDBOX

    RequestExecutionLevel user
    ShowInstDetails show
    ShowUnInstDetails show

    !define MUI_WELCOMEPAGE_TITLE "${INSTALL_WELCOMEPAGE_TITLE}"
    !insertmacro MUI_PAGE_WELCOME
    !insertmacro MUI_PAGE_LICENSE "${BUILD_RESOURCES_DIR}\license.txt"
    !define MUI_PAGE_CUSTOMFUNCTION_LEAVE verifyInstDir
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

    !define REGPATH_UNINSTSUBKEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\JOED5"

    Section 
        SetOutPath "$INSTDIR"
        # clean-up locales/ and resources/ before update - 1.3.1000 hack
        RMDIR /r "$INSTDIR\locales"
        RMDIR /r "$INSTDIR\resources"

        File /r "${PROJECT_DIR}\dist_electron\win${ARCH}-unpacked\*.*"

        # prepare uninstaller
        WriteUninstaller "$INSTDIR\Uninstall.exe"

        # start menu
        CreateDirectory "${MENUDIRNAME}"
        CreateShortCut "${MENUITEM1NAME}" "$INSTDIR\JOED5.exe" "$NO_SANDBOX"
        IfFileExists "${MENUITEM2OLDNAME}" +1 +2
          DELETE "${MENUITEM2OLDNAME}"
        CreateShortCut "${MENUITEM2NAME}" "$INSTDIR\Uninstall.exe" ""

        # user registory
        WriteRegStr HKCU "${REGPATH_UNINSTSUBKEY}" "DisplayName" "${INSTALLERCAPTION}"
        WriteRegStr HKCU "${REGPATH_UNINSTSUBKEY}" "Publisher" "${JOEDPUBLISHER}"
        WriteRegStr HKCU "${REGPATH_UNINSTSUBKEY}" "DisplayVersion" "$%VUE_APP_VERSION%"
        WriteRegStr HKCU "${REGPATH_UNINSTSUBKEY}" "DisplayIcon" "$INSTDIR\JOED5.exe,0"
        WriteRegStr HKCU "${REGPATH_UNINSTSUBKEY}" "UninstallString" '"$INSTDIR\Uninstall.exe"'
        WriteRegStr HKCU "${REGPATH_UNINSTSUBKEY}" "QuietUninstallString" '"$INSTDIR\Uninstall.exe" /S'
        WriteRegDWORD HKCU "${REGPATH_UNINSTSUBKEY}" "NoModify" 1
        WriteRegDWORD HKCU "${REGPATH_UNINSTSUBKEY}" "NoRepair" 1

        # clean up APPDATA/JOED5
        RMDIR /r "$APPDATA\JOED5\Dictionaries"
        RMDIR /r "$APPDATA\JOED5\Cache"
        RMDIR /r "$APPDATA\JOED5\Code Cache"
        RMDIR /r "$APPDATA\JOED5\DawnCache"
        RMDIR /r "$APPDATA\JOED5\GPUCache"
    SectionEnd

    Section "Uninstall" 
        DELETE "${MENUITEM1NAME}"
        DELETE "${MENUITEM2NAME}"
        IfFileExists "${MENUITEM2OLDNAME}" +1 +2
          DELETE "${MENUITEM2OLDNAME}"
        RMDIR "${MENUDIRNAME}"
        Delete "$INSTDIR\Uninstall.exe"
        RMDIR /r "$INSTDIR"
        DeleteRegKey HKCU "${REGPATH_UNINSTSUBKEY}"
    SectionEnd

    Function un.DeleteDataFolder
        RMDIR /r "$APPDATA\JOED5"
        MessageBox MB_ICONINFORMATION|MB_OK "${MSG_MSGBOX}"
    FunctionEnd

    Function verifyInstDir
        # check $INSTDIR is local drive or not
        StrCpy $NO_SANDBOX ''

        StrCpy $0 $INSTDIR 1
        !if $0 == '/'
            # UNC path or so
            MessageBox MB_OKCANCEL ${INSTALL_NETWORKDRIVE_ALERT} IDCANCEL goback1 IDOK setoption1
            goback1:
                Abort
            setoption1:
                StrCpy $NO_SANDBOX '--no-sandbox'
        !else
            # check drive type
            System::Call 'KERNEL32::GetDriveType(t "$0:\") i .r1'
            !if $1 == ${DRIVE_REMOTE}
                MessageBox MB_OKCANCEL ${INSTALL_NETWORKDRIVE_ALERT} IDCANCEL goback2 IDOK setoption2
                goback2:
                    Abort
                setoption2:
                    StrCpy $NO_SANDBOX '--no-sandbox'
            !endif
        !endif
    FunctionEnd
!else
    !error "JOEDINSTALLER not defined."
!endif

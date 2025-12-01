@ECHO OFF

SET OPTS=%1

FOR /F %%V IN ('jq -r ".version" "manifest.json"') DO SET "VER=%%V"
SET NNTPNotify=NNTPNotify-%VER%.zip

IF "%OPTS%"=="submit" GOTO :SUBMIT

:BUILD
CALL web-ext build --overwrite-dest --filename NNTPNotify-%VER%.zip --artifacts-dir . --source-dir .\ --ignore-files FFAPI.json *.cmd *.md updates/
MKDIR updates\%VER%
GOTO :END

:SUBMIT
CALL web-ext sign --source-dir ./SFExtFF/ --channel unlisted
GOTO :END

:END
PAUSE
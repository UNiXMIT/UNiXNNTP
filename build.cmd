@ECHO OFF

SET OPTS=%1

FOR /F %%V IN ('jq -r ".version" "manifest.json"') DO SET "VER=%%V"

IF "%OPTS%"=="submit" GOTO :SUBMIT

:BUILD
CALL web-ext build --overwrite-dest --filename NNTPNotify-%VER%.zip --artifacts-dir . --source-dir ./ --ignore-files package.json *.cmd *.md updates/
MKDIR updates\%VER%
GOTO :END

:SUBMIT
CALL web-ext sign --source-dir ./ --ignore-files package.json *.cmd *.md updates/ --channel unlisted
GOTO :END

:END
PAUSE
@ECHO OFF

SET OPTS=%1

FOR /F %%V IN ('jq -r ".version" "manifest.json"') DO SET "VER=%%V"
SET NNTPNotify=NNTPNotify-%VER%.zip

IF "%OPTS%"=="submit" GOTO :SUBMIT

:BUILD
CALL web-ext build --overwrite-dest --filename %NNTPNotify% --artifacts-dir . --source-dir .\ --ignore-files FFAPI.json *.cmd *.md updates/
MKDIR updates\%VER%
GOTO :END

:SUBMIT
FOR /F "usebackq delims=" %%A IN (`jq -r ".AMO_KEY" FFAPI.json`) DO SET AMO_KEY=%%A
FOR /F "usebackq delims=" %%B IN (`jq -r ".AMO_SECRET" FFAPI.json`) DO SET AMO_SECRET=%%B
CALL web-ext sign --api-key %AMO_KEY% --api-secret %AMO_SECRET% --upload-source-code %NNTPNotify% --channel unlisted
GOTO :END

:END
PAUSE
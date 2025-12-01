@ECHO OFF
FOR /F %%V IN ('jq -r ".version" "manifest.json"') DO SET "VER=%%V"

gh release create %VER% ^
    --latest ^
    --title "%VER%" ^
    --repo "UNiXMIT/UNiXNNTP" ^
    --target "main" ^
    "updates\%VER%\0158949de7f44eb48392-%VER%.xpi"
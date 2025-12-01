@ECHO OFF
set "PATH=C:\Program Files\7-Zip;%PATH%"
del NNTPNotify.zip
:: powershell Compress-Archive \GitHub\UNiXNNTP\* \GitHub\UNiXNNTP\NNTPNotify.zip
7z a NNTPNotify.zip .\* -x!.git -x!.gitignore
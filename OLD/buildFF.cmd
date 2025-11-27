@ECHO OFF
set "PATH=C:\Program Files\7-Zip;%PATH%"
del NNTP.zip
:: powershell Compress-Archive \GitHub\UNiXNNTP\* \GitHub\UNiXNNTP\NNTP.zip
7z a NNTP.zip .\* -x!buildFF.cmd -x!updates
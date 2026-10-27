@echo off
REM Serve the slides offline on http://localhost:8000/
cd /d "%~dp0"
where py >nul 2>nul && (py -3 serve.py --open %*) || (python serve.py --open %*)

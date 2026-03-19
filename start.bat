@echo off
:: SwordPen — start development server (Windows)
cd /d "%~dp0"

echo.
echo   SwordPen -- Vocabulary App
echo   ------------------------------------

:: Install dependencies if node_modules is missing
if not exist "node_modules\" (
  echo   Installing dependencies...
  npm install
  if errorlevel 1 (
    echo   ERROR: npm install failed. Make sure Node.js is installed.
    pause
    exit /b 1
  )
)

echo   Starting dev server -^> http://localhost:5173
echo.
npm run dev

@echo off
echo Setting up Git repository and pushing to GitHub...
echo.

REM Initialize git if not already done
if not exist .git (
    echo Initializing Git repository...
    git init
    echo.
)

REM Add all files
echo Adding files to Git...
git add .
echo.

REM Create initial commit
echo Creating initial commit...
git commit -m "Initial commit: Aura Sacred Shifter OS with auth fixes and profile management"
echo.

REM Add remote origin (replace YOUR_USERNAME with your GitHub username)
echo Adding remote origin...
echo IMPORTANT: Replace YOUR_USERNAME in the next command with your actual GitHub username
pause
git remote add origin https://github.com/YOUR_USERNAME/aura-sacred-shifter.git
echo.

REM Push to GitHub
echo Pushing to GitHub...
git branch -M main
git push -u origin main
echo.

echo Done! Your repository should now be available on GitHub.
pause
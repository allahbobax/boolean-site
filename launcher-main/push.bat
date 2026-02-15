@echo off
echo Committing changes...
git add .
:: current time: %date% %time%
git commit -m "auto-commit: %date% %time%"
echo Pushing to origin/main...
git push origin main
echo Done!
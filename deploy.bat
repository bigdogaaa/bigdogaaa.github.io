@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion

echo.
echo =============================================
echo        Quartz 一键同步（自动提交 + 推送）
echo =============================================
echo.

cd /d "%~dp0"

echo 添加改动...
git add .

echo.
echo 提交改动（如果有变更）...
git commit -m "自动同步：%date% %time:~0,8%" || echo 没有新的改动，跳过 commit

echo.
echo 执行 Quartz sync --no-pull ...
echo.

npx quartz sync --no-pull

echo.
echo =============================================
echo               执行完成
echo =============================================
echo 按任意键退出...
pause >nul
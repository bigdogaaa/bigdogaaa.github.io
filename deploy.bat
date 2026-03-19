@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion

echo =============================================
echo       Quartz 发布（生成首页 + 提交 + 同步）
echo =============================================

cd /d "%~dp0"

echo.
echo 【1/3】生成首页和文章目录...
node generate_c.js

echo.
echo 【2/3】添加改动并提交...
git add .
git commit -m "自动同步：%date% %time:~0,8%" || echo 没有新的改动，跳过 commit

echo.
echo 【3/3】执行 Quartz sync ...
npx quartz sync --no-pull

echo =============================================
echo               Quartz 发布完成
echo =============================================
pause >nul
@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion

echo.
echo =============================================
echo     Quartz 一键同步（清理 + 目录 + 推送）
echo =============================================
echo.

cd /d "%~dp0"

echo.
echo 【1/5】进入 content 目录...
cd content

echo.
echo 【2/5】根据 .gitignore 清理文件...
echo.

REM 删除未跟踪且被 .gitignore 忽略的文件
git clean -fdX

echo.
echo 删除 .git 目录（如果存在）...
if exist ".git" (
    rmdir /s /q .git
    echo 已删除 content/.git
)

echo.
echo 删除 .gitignore 文件（如果存在）...
if exist ".gitignore" (
    del /f /q .gitignore
    echo 已删除 content/.gitignore
)

echo.
echo 返回项目根目录...
cd ..

echo.
echo 【3/5】生成博客目录（generate_c.js）...
echo.

node generate_c.js

echo.
echo 【4/5】添加改动...
git add .

echo.
echo 提交改动（如果有变更）...
git commit -m "自动同步：%date% %time:~0,8%" || echo 没有新的改动，跳过 commit

echo.
echo 【5/5】执行 Quartz sync --no-pull ...
echo.

npx quartz sync --no-pull

echo.
echo =============================================
echo               执行完成
echo =============================================
echo 按任意键退出...
pause >nul
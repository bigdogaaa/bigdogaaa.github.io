@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion

echo.
echo =============================================
echo     Quartz 自动同步（按 .gitignore 清理 + 目录生成 + 推送）
echo =============================================
echo.

cd /d "%~dp0"

echo.
echo 【1/5】根据 .gitignore 清理 content 目录...
cd content

REM 使用 git clean 按 .gitignore 删除未跟踪文件
REM -f 强制删除, -d 删除目录, -X 只删除被忽略的文件
git clean -fdX

echo.
echo 【2/5】删除 .git 目录（如果存在）...
if exist ".git" (
    rmdir /s /q .git
    echo 已删除 content/.git
)

echo.
echo 【3/5】删除 .gitignore 文件（如果存在）...
if exist ".gitignore" (
    del /f /q .gitignore
    echo 已删除 content/.gitignore
)

echo.
echo 【4/5】删除隐藏目录或临时目录（如 .obsidian 等）...
for /d %%D in (.*) do (
    if exist "%%D" (
        rmdir /s /q "%%D"
        echo 已删除目录 %%D
    )
)

echo.
echo 返回项目根目录...
cd ..

echo.
echo 【5/5】生成博客首页（generate_c.js）...
node generate_c.js

echo.
echo 添加改动...
git add .

echo.
echo 提交改动（如果有变更）...
git commit -m "自动同步：%date% %time:~0,8%" || echo 没有新的改动，跳过 commit

echo.
echo 执行 Quartz sync --no-pull ...
npx quartz sync --no-pull

echo.
echo =============================================
echo               执行完成
echo =============================================
echo 按任意键退出...
pause >nul
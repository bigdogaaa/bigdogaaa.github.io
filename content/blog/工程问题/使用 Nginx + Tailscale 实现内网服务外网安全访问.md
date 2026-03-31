---
title: 使用 Nginx + Tailscale 实现内网服务外网安全访问
description:
date: 2026-03-31 10:54
draft: false
tags:
  - 
---

以下是一个完整的 Markdown 文档，整合了使用 **Nginx** 在 Windows 上做 TCP 端口转发，并将其注册为系统服务，再结合 **Tailscale** 实现外网安全访问的详细步骤。你可以直接保存为 `.md` 文件，或按需调整 IP/端口信息。

---


## 1. 概述

在公司或内网环境中，某些服务（如 `http://10.26.20.168:20001`）只能在内网访问。  
通过本方案，我们将在内网一台 Windows 机器上部署 Nginx，将目标服务的端口转发到本地，再借助 **Tailscale** 组建虚拟局域网，从而允许你在家中通过 Tailscale 网络访问该服务。

**整体架构**：
```
[家庭电脑] --(Tailscale)--> [内网Windows机器] --(Nginx转发)--> [内网服务 10.26.20.168:20001]
```

访问方式：
- 在家电脑上连接 Tailscale 后，直接访问 `http://<内网Windows机器的Tailscale IP>:20001`，即可访问内网服务。

---

## 2. 前提条件

- **内网 Windows 机器**（以下简称“转发机”）：
  - 操作系统：Windows 10/11 或 Windows Server 2016+
  - 能够访问目标内网服务（`10.26.20.168:20001`）
  - 拥有管理员权限（用于安装服务、配置防火墙）
- **家庭电脑**：安装 Tailscale 客户端并登录
- **Tailscale 账号**：免费注册即可

---

## 3. 在转发机上安装与配置 Nginx

### 3.1 下载 Nginx

1. 访问 Nginx 官网：http://nginx.org/en/download.html
2. 下载 Windows 稳定版（例如 `nginx-1.24.0.zip`）
3. 解压到指定目录，例如 `D:\nginx`

### 3.2 配置 TCP 端口转发

Nginx 默认只处理 HTTP 流量，但通过 `stream` 模块可以转发任意 TCP 流量。

1. 打开 `D:\nginx\conf\nginx.conf`
2. 在文件末尾（`http` 块外面）添加以下 `stream` 配置：

```nginx
stream {
    server {
        listen 20001;                 # 本地监听端口
        proxy_pass 10.26.20.168:20001;  # 目标内网服务
        proxy_connect_timeout 5s;
        proxy_timeout 30s;
    }
}

# 原有的 http 块保持不变
http {
    ...
}
```

- **说明**：
  - `listen 20001`：Nginx 在本机所有 IP 上监听 20001 端口（包括 Tailscale 虚拟网卡）
  - `proxy_pass`：将接收到的所有 TCP 连接转发到内网服务的 IP 和端口

### 3.3 测试 Nginx 配置

1. 打开命令提示符（管理员），进入 `D:\nginx`
2. 测试配置文件语法：
   ```cmd
   nginx -t
   ```
   输出应包含 `test is successful`。
3. 手动启动 Nginx 测试：
   ```cmd
   start nginx
   ```
4. 检查进程是否启动：
   ```cmd
   tasklist | findstr nginx
   ```
   应看到两个 `nginx.exe` 进程。
5. 在转发机本地测试转发是否生效：
   ```cmd
   curl http://127.0.0.1:20001
   ```
   如果返回内网服务的响应，则配置成功。

6. 停止测试进程：
   ```cmd
   nginx -s stop
   ```

---

## 4. 将 Nginx 注册为 Windows 服务（开机自启）

使用 **WinSW** 工具将 Nginx 包装为 Windows 服务，保证其后台运行且能优雅停止。

### 4.1 下载 WinSW

- 访问 https://github.com/winsw/winsw/releases
- 下载 `WinSW-net4.exe`（适用于 Windows 7+）或 `WinSW-net461.exe`
- 将下载的文件放入 `D:\nginx` 目录，并重命名为 `nginx-service.exe`

### 4.2 创建配置文件

在 `D:\nginx` 目录下新建文件 `nginx-service.xml`，内容如下（请根据实际路径修改）：

```xml
<service>
    <id>nginx</id>
    <name>nginx</name>
    <description>Nginx TCP Port Forwarding</description>
    <executable>D:\nginx\nginx.exe</executable>
    <stopexecutable>D:\nginx\nginx.exe -s stop</stopexecutable>
    <logpath>D:\nginx\logs\</logpath>
    <logmode>roll</logmode>
</service>
```

### 4.3 安装服务

以**管理员身份**打开命令提示符，执行：

```cmd
cd /d D:\nginx
nginx-service.exe install
```

若看到 `Service 'nginx (nginx)' was installed successfully.` 则安装成功。

### 4.4 启动服务并设置自动启动

```cmd
nginx-service.exe start
```

打开“服务”管理器（`services.msc`），找到 `nginx` 服务，确认其状态为“正在运行”，启动类型为“自动”。

---

## 5. 安装与配置 Tailscale

### 5.1 在转发机上安装 Tailscale

1. 访问 https://tailscale.com/download 下载 Windows 客户端
2. 安装并登录你的 Tailscale 账号
3. 登录后，转发机会获得一个 Tailscale 虚拟 IP（例如 `100.64.0.1`）
4. 在转发机的命令行中执行 `tailscale ip` 可查看当前虚拟 IP

### 5.2 在家庭电脑上安装 Tailscale

同样下载并安装 Tailscale 客户端，使用同一账号登录。  
家庭电脑也会获得一个 Tailscale IP（例如 `100.64.0.2`）。

### 5.3 验证 Tailscale 连通性

在家庭电脑的命令行中执行：

```cmd
ping 100.64.0.1   # 替换为转发机的 Tailscale IP
```

若能 ping 通，说明虚拟局域网已建立。

---

## 6. 访问内网服务

### 6.1 确定访问地址

转发机的 Tailscale IP 可以通过 `tailscale ip` 在转发机上获得，或在 Tailscale 管理后台查看。  
假设转发机的 Tailscale IP 为 `100.64.0.1`，则：

- 服务地址：`http://100.64.0.1:20001`

### 6.2 在家测试访问

在家庭电脑上打开浏览器，输入 `http://100.64.0.1:20001`，应能正常打开内网服务的页面。

若服务是 TCP 协议（非 HTTP），可以使用 `telnet 100.64.0.1 20001` 测试连接。

---

## 7. 防火墙配置（如遇问题）

如果访问失败，请检查转发机的 Windows 防火墙：

- 确保 20001 端口入站规则允许 TCP 流量
- 添加规则（管理员命令）：
  ```cmd
  netsh advfirewall firewall add rule name="Nginx_20001" dir=in action=allow protocol=tcp localport=20001
  ```

Tailscale 会默认放行所有流量，一般无需额外配置。

---

## 8. 常见问题排查

| 现象 | 可能原因 | 解决方法 |
|------|---------|----------|
| Nginx 启动失败 | 端口被占用或配置文件错误 | 执行 `nginx -t` 查看错误，用 `netstat -ano \| findstr :20001` 检查端口 |
| 本地访问 127.0.0.1:20001 正常，但外网无法访问 | 防火墙未放行端口 | 添加入站规则（见第7节） |
| Tailscale 能 ping 通但服务不可达 | Nginx 绑定 IP 错误 | 检查 `listen` 是否使用 `0.0.0.0` 而非 `127.0.0.1` |
| 服务运行一段时间后停止 | Nginx 进程崩溃 | 查看 `logs\error.log`，检查目标服务是否可用 |
| 家庭电脑无法 ping 通转发机 | Tailscale 未登录或网络问题 | 重新登录 Tailscale，确认两台设备在同一账号下 |

---

## 9. 小结

通过本方案，你实现了：
- 使用 Nginx 将内网服务端口转发到本地
- 将 Nginx 注册为 Windows 服务，保证稳定运行
- 利用 Tailscale 组建安全虚拟局域网，从外网安全访问内网服务

此方法无需公网 IP，不依赖端口映射，且流量通过 WireGuard 加密，安全可靠。

---

如需进一步定制（如转发多个端口、使用域名访问等），可修改 Nginx 的 `stream` 配置或结合 `http` 反向代理。
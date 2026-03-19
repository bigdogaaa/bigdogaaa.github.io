---
title: 多个大模型统一访问端口
date: 2026-03-19
tags:
  - 龙虾军团
  - OpenClaw
---
# 使用工具 - LiteLLM

> 为什么使用这个？以百炼平台提供的多种大模型为例，我们想统一接入openclaw，避免在openclaw.json中进行繁琐的模型提供者（provider）配置。

1. 安装
	```shell
	pip install litellm
	```
2. 创建目录:
	```shell
	make dir -p /data/LiteLLM
	```
3. 进入目录，并创建配置文件: 
	```shell
	cd /data/LiteLLM && vim litellm_config.yaml
	```
	配置文件如下，注意，api_key我们引入了环境变量**DASHSCOPE_API_KEY**：
	```yaml
	model_list:
	
	
	- model_name: dashscope-all
	  litellm_params:
	    model: openai/qwen3-vl-plus-2025-12-19
	    api_base: https://dashscope.aliyuncs.com/compatible-mode/v1
	    api_key: os.environ/DASHSCOPE_API_KEY
	
	- model_name: dashscope-all
	  litellm_params:
	    model: openai/glm-4.7
	    api_base: https://dashscope.aliyuncs.com/compatible-mode/v1
	    api_key: os.environ/DASHSCOPE_API_KEY
	
	- model_name: dashscope-all
	  litellm_params:
	    model: openai/qwen3-vl-flash-2026-01-22
	    api_base: https://dashscope.aliyuncs.com/compatible-mode/v1
	    api_key: os.environ/DASHSCOPE_API_KEY
	
	- model_name: dashscope-all
	  litellm_params:
	    model: openai/qwen3-max-2026-01-23
	    api_base: https://dashscope.aliyuncs.com/compatible-mode/v1
	    api_key: os.environ/DASHSCOPE_API_KEY
	
	- model_name: dashscope-all
	  litellm_params:
	    model: openai/MiniMax-M2.1
	    api_base: https://dashscope.aliyuncs.com/compatible-mode/v1
	    api_key: os.environ/DASHSCOPE_API_KEY
	
	- model_name: dashscope-all
	  litellm_params:
	    model: openai/kimi-k2.5
	    api_base: https://dashscope.aliyuncs.com/compatible-mode/v1
	    api_key: os.environ/DASHSCOPE_API_KEY
	
	- model_name: dashscope-all
	  litellm_params:
	    model: openai/qwen3-coder-next
	    api_base: https://dashscope.aliyuncs.com/compatible-mode/v1
	    api_key: os.environ/DASHSCOPE_API_KEY
	
	- model_name: dashscope-all
	  litellm_params:
	    model: openai/glm-5
	    api_base: https://dashscope.aliyuncs.com/compatible-mode/v1
	    api_key: os.environ/DASHSCOPE_API_KEY
	
	- model_name: dashscope-all
	  litellm_params:
	    model: openai/qwen3.5-plus
	    api_base: https://dashscope.aliyuncs.com/compatible-mode/v1
	    api_key: os.environ/DASHSCOPE_API_KEY
	
	- model_name: dashscope-all
	  litellm_params:
	    model: openai/qwen3.5-plus-2026-02-15
	    api_base: https://dashscope.aliyuncs.com/compatible-mode/v1
	    api_key: os.environ/DASHSCOPE_API_KEY
	
	- model_name: dashscope-all
	  litellm_params:
	    model: openai/qwen3.5-397b-a17b
	    api_base: https://dashscope.aliyuncs.com/compatible-mode/v1
	    api_key: os.environ/DASHSCOPE_API_KEY
	
	- model_name: dashscope-all
	  litellm_params:
	    model: openai/qwen3.5-122b-a10b
	    api_base: https://dashscope.aliyuncs.com/compatible-mode/v1
	    api_key: os.environ/DASHSCOPE_API_KEY
	
	- model_name: dashscope-all
	  litellm_params:
	    model: openai/qwen3.5-flash
	    api_base: https://dashscope.aliyuncs.com/compatible-mode/v1
	    api_key: os.environ/DASHSCOPE_API_KEY
	
	- model_name: dashscope-all
	  litellm_params:
	    model: openai/qwen3.5-flash-2026-02-23
	    api_base: https://dashscope.aliyuncs.com/compatible-mode/v1
	    api_key: os.environ/DASHSCOPE_API_KEY
	
	- model_name: dashscope-all
	  litellm_params:
	    model: openai/qwen3.5-35b-a3b
	    api_base: https://dashscope.aliyuncs.com/compatible-mode/v1
	    api_key: os.environ/DASHSCOPE_API_KEY
	
	- model_name: dashscope-all
	  litellm_params:
	    model: openai/qwen3.5-27b
	    api_base: https://dashscope.aliyuncs.com/compatible-mode/v1
	    api_key: os.environ/DASHSCOPE_API_KEY
	
	- model_name: dashscope-all
	  litellm_params:
	    model: openai/MiniMax-M2.5
	    api_base: https://dashscope.aliyuncs.com/compatible-mode/v1
	    api_key: os.environ/DASHSCOPE_API_KEY
	
	- model_name: dashscope-all
	  litellm_params:
	    model: openai/qwen-flash-character-2026-02-26
	    api_base: https://dashscope.aliyuncs.com/compatible-mode/v1
	    api_key: os.environ/DASHSCOPE_API_KEY
	```
1. 启动脚本如下，其中环境变量也可以直接在命令行进行设置，例如*export DASHSCOPE_API_KEY=XXX*：
	```shell
	#!/bin/bash
	DASHSCOPE_API_KEY=XXX litellm \
	--config litellm_config.yaml \
	--host 127.0.0.1 \
	--port 13000
	```
2. 修改openclaw中对应的provider：
	```json
	 "providers": {
	      "router": {
	        "baseUrl": "http://127.0.0.1:13000/v1",
	        "apiKey": "none",
	        "api": "openai-completions",
	        "models": [
	          {
	            "id": "dashscope-all",
	            "name": "dashscope-all",
	            "reasoning": true,
	            "input": [
	              "text",
	              "image"
	            ],
	            "cost": {
	              "input": 0,
	              "output": 0,
	              "cacheRead": 0,
	              "cacheWrite": 0
	            },
	            "contextWindow": 200000,
	            "maxTokens": 128000
	          }
	        ]
	      },
	      ...
	    }
	```
	对比下不使用LiteLLM的配置：
	```json
	      "huoshan": {
	        "baseUrl": "https://ark.cn-beijing.volces.com/api/coding/v3",
	        "apiKey": "auth-profile:huoshan:coding_plan",
	        "api": "openai-completions",
	        "models": [
	          {
	            "id": "ark-code-latest",
	            "name": "ark-code-latest",
	            "contextWindow": 256000,
	            "maxTokens": 32000,
	            "input": [
	              "text",
	              "image"
	            ]
	          },
	          {
	            "id": "doubao-seed-code",
	            "name": "doubao-seed-code",
	            "contextWindow": 256000,
	            "maxTokens": 32000,
	            "input": [
	              "text",
	              "image"
	            ]
	          },
	          {
	            "id": "glm-4.7",
	            "name": "glm-4.7",
	            "contextWindow": 200000,
	            "maxTokens": 128000,
	            "input": [
	              "text"
	            ]
	          },
	          {
	            "id": "deepseek-v3.2",
	            "name": "deepseek-v3.2",
	            "contextWindow": 128000,
	            "maxTokens": 32000
	          },
	          {
	            "id": "doubao-seed-2.0-code",
	            "name": "doubao-seed-2.0-code",
	            "contextWindow": 256000,
	            "maxTokens": 128000,
	            "input": [
	              "text",
	              "image"
	            ]
	          },
	          {
	            "id": "doubao-seed-2.0-pro",
	            "name": "doubao-seed-2.0-pro",
	            "contextWindow": 256000,
	            "maxTokens": 128000,
	            "input": [
	              "text",
	              "image"
	            ]
	          },
	          {
	            "id": "doubao-seed-2.0-lite",
	            "name": "doubao-seed-2.0-lite",
	            "contextWindow": 256000,
	            "maxTokens": 128000,
	            "input": [
	              "text",
	              "image"
	            ]
	          },
	          {
	            "id": "minimax-m2.5",
	            "name": "minimax-m2.5",
	            "contextWindow": 200000,
	            "maxTokens": 128000,
	            "input": [
	              "text"
	            ]
	          },
	          {
	            "id": "kimi-k2.5",
	            "name": "kimi-k2.5",
	            "contextWindow": 256000,
	            "maxTokens": 32000,
	            "input": [
	              "text",
	              "image"
	            ]
	          }
	        ]
	      }
	```

# 更多LiteLLM的配置
参见官方文档：[LiteLLM官方配置文档](https://docs.litellm.ai/docs/proxy/configs)。
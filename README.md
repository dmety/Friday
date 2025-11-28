# F.R.I.D.A.Y. 战术辅助界面

受钢铁侠（Iron Man）人工智能 "Friday" 启发的 Web 应用程序。本项目使用 Google Gemini Live API 实现实时语音、视觉交互，并配以科幻风格的 HUD（平视显示器）界面。

## 功能特性

*   **实时语音对话**: 利用 Gemini 2.5 Flash Native Audio 模型实现超低延迟语音交流。
*   **视觉感知**: AI 可以通过摄像头“看到”你，并对你的动作、表情或展示的物体做出反应。
*   **沉浸式 HUD**: 纯黑背景、青色线条、故障艺术（Glitch）效果，还原电影中的战术界面。
*   **系统监控**: 模拟显示 CPU 温度、内存状态、网络延迟和生物体征数据。
*   **面部追踪模拟**: 界面中心的目标锁定框会跟随你的位置（模拟效果）。

## 技术栈

*   **Frontend**: React, Tailwind CSS
*   **AI**: Google GenAI SDK (Gemini Live API)
*   **Audio**: Web Audio API (PCM Stream Processing)

## 使用方法

1.  配置 `.env` 文件中的 `API_KEY`。
2.  启动应用。
3.  点击界面中心的“初始化系统”按钮。
4.  授予摄像头和麦克风权限。
5.  等待系统上线，听到“主人，星期五已上线”后即可开始对话。

## 协议状态

*   **Status**: ONLINE
*   **Target**: MASTER

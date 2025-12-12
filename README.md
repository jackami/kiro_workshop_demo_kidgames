# 👻 小鬼消消乐 (Ghost Match Game)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)

一个现代化的网页消除类益智游戏，采用纯前端技术栈构建。玩家通过交换相邻的小鬼图标来形成三个或更多相同小鬼的连线，消除它们获得分数。游戏具有流畅的动画效果、直观的操作体验和渐进式难度设计。

## ✨ 游戏特色

🎮 **经典三消玩法** - 8x8网格，5种以上小鬼类型，支持水平和垂直匹配  
🎯 **智能连击系统** - 单次交换触发连锁反应，分数倍数递增  
📱 **全平台适配** - 响应式设计，完美支持桌面端、移动端和触屏设备  
🎵 **沉浸式体验** - Web Audio API驱动的音效系统  
⚡ **流畅动画** - CSS3硬件加速，60fps丝滑体验  
🧪 **高质量代码** - 完整的单元测试和基于属性的测试覆盖

## 项目结构

```
-
├── index.html              # 主游戏页面，包含8x8网格容器
├── package.json            # 项目配置和依赖
├── README.md              # 项目说明文档
├── css/
│   ├── main.css           # 核心游戏样式、网格布局、小鬼图标
│   ├── animations.css     # 交换、消除、下落动画
│   └── responsive.css     # 移动端/桌面端自适应布局
├── js/
│   ├── core/
│   │   ├── GameEngine.js     # 状态机、游戏循环、会话管理
│   │   ├── GameBoard.js      # 8x8网格数据结构、单元格操作
│   │   └── GameState.js      # 分数、计时器、连击跟踪
│   ├── components/
│   │   ├── GhostRenderer.js  # DOM渲染、视觉反馈、动画
│   │   ├── InputHandler.js   # 点击/触摸事件、选择、交换验证
│   │   └── AudioManager.js   # 消除、连击、游戏结束音效
│   ├── algorithms/
│   │   ├── MatchDetector.js  # 基于DFS的水平/垂直匹配检测
│   │   └── GravitySystem.js  # 下落逻辑、补充机制
│   ├── constants.js       # 小鬼类型、评分规则、游戏配置
│   └── main.js            # 应用程序初始化和设置
├── assets/
│   ├── images/            # 5+种小鬼类型精灵、UI元素
│   └── sounds/            # 消除、连击、游戏结束音频文件
├── tests/
│   ├── unit/              # 组件特定功能测试
│   ├── property/          # fast-check基于属性的测试（100+次迭代）
│   ├── integration/       # 完整游戏会话流程测试
│   └── test-config.js     # 测试配置和工具
└── .kiro/
    ├── specs/             # 需求、设计、任务文档
    └── steering/          # 项目指导和约定
```

## 🛠️ 技术架构

### 核心技术栈
- **HTML5** - 语义化标记，跨浏览器兼容
- **CSS3** - 硬件加速动画，响应式布局
- **JavaScript ES6+** - 模块化架构，现代语法特性
- **Web Audio API** - 高质量音效系统
- **DOM操作** - 高效的游戏渲染和交互

### 架构设计
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   表现层 (UI)    │    │   控制层 (Input) │    │   逻辑层 (Core)  │
│  GhostRenderer  │◄──►│  InputHandler   │◄──►│   GameEngine    │
│  AudioManager   │    │                 │    │   GameBoard     │
└─────────────────┘    └─────────────────┘    │   GameState     │
                                              └─────────────────┘
                                                       ▲
                                              ┌─────────────────┐
                                              │ 算法层 (Logic)   │
                                              │  MatchDetector  │
                                              │  GravitySystem  │
                                              └─────────────────┘
```

### 设计模式
- **🏗️ 分层架构** - 清晰的职责分离
- **🔄 状态机模式** - 游戏状态管理
- **📡 事件驱动** - 松耦合的组件通信
- **🧩 模块化设计** - 可维护和可扩展

## 🧪 测试体系

本项目采用多层次测试策略，确保代码质量和游戏逻辑的正确性：

### 测试类型
- **单元测试** - 组件级功能验证
- **属性测试** - 基于 fast-check 的随机化测试（每个属性100+次迭代）
- **集成测试** - 端到端游戏流程验证

### 运行测试

```bash
# 运行所有测试
npm test

# 分类测试
npm run test:unit      # 单元测试
npm run test:property  # 属性测试
npm run test:watch     # 监视模式

# 查看测试覆盖率
npm run test:coverage
```

### 测试覆盖
- ✅ 游戏核心逻辑 100% 覆盖
- ✅ 匹配算法正确性验证
- ✅ 状态管理完整性测试
- ✅ UI交互响应性测试

## 🚀 快速开始

### 在线体验
直接在浏览器中打开 `index.html` 文件即可开始游戏！

### 本地开发

```bash
# 克隆项目
git clone <repository-url>
cd ghost-match-game

# 安装依赖
npm install

# 启动开发服务器
npm run start
# 游戏将在 http://localhost:8000 启动

# 运行测试
npm test
```

## 🎮 游戏玩法

### 基础操作
1. **选择小鬼**: 点击任意小鬼图标进行选择
2. **交换位置**: 点击相邻的小鬼完成交换
3. **形成连线**: 水平或垂直排列3个或更多相同小鬼
4. **获得分数**: 消除的小鬼越多，分数越高
5. **连击奖励**: 连续消除可获得分数倍数奖励

### 游戏机制
- **🎯 智能匹配**: DFS算法精确检测所有可能的匹配组合
- **⚡ 重力系统**: 消除后小鬼自动下落，顶部自动补充新小鬼
- **🔥 连击系统**: 单次操作触发的连续消除可获得额外分数
- **⏱️ 实时反馈**: 分数、计时器和游戏状态实时更新
- **🎵 音效反馈**: 每个游戏动作都有对应的音效提示

## 🌐 浏览器兼容性

| 浏览器 | 版本要求 | 支持状态 |
|--------|----------|----------|
| Chrome | 80+ | ✅ 完全支持 |
| Firefox | 75+ | ✅ 完全支持 |
| Safari | 13+ | ✅ 完全支持 |
| Edge | 80+ | ✅ 完全支持 |
| iOS Safari | 13+ | ✅ 移动优化 |
| Chrome Mobile | 80+ | ✅ 触屏优化 |

## 📈 性能特性

- **⚡ 60fps 流畅动画** - CSS3 硬件加速
- **🎯 高效算法** - DFS匹配检测，O(n)时间复杂度
- **💾 内存优化** - 智能资源管理和垃圾回收
- **📱 移动优化** - 触屏友好，响应式布局
- **🔧 开发友好** - 模块化架构，易于维护和扩展

## 🤝 开发指南

### 代码规范
- **文件命名**: 类文件 PascalCase，工具模块 camelCase
- **模块系统**: ES6 import/export
- **注释规范**: JSDoc 格式，中英文混合
- **测试要求**: 新功能必须包含对应测试

### 贡献流程
1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者们！

---

**🎮 现在就开始游戏吧！打开 `index.html` 体验小鬼消消乐的乐趣！**
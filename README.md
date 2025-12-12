# 小鬼消消乐 (Ghost Match Game)

一个基于HTML5、CSS3和JavaScript的网页消除类游戏。玩家通过交换相邻的小鬼图标来形成三个或更多相同小鬼的连线，从而消除它们并获得分数。

## 项目结构

```
/
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

## 技术栈

- **HTML5**: 语义化标记、游戏容器结构、跨浏览器兼容性
- **CSS3**: 样式、硬件加速动画、响应式布局
- **JavaScript (ES6+)**: 游戏逻辑、DOM操作、事件处理、状态管理
- **Web Audio API**: 音效管理和音频控制
- **fast-check**: JavaScript基于属性的测试库

## 开发环境设置

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
# 使用Python (推荐)
npm run start

# 或使用Node.js serve
npm run serve
```

### 运行测试

```bash
# 运行所有测试
npm test

# 只运行单元测试
npm test:unit

# 只运行基于属性的测试
npm test:property

# 监视模式
npm run test:watch
```

## 游戏特性

### 核心玩法
- **8x8网格**: 具有清晰视觉边界和网格线的游戏板
- **5+种小鬼类型**: 不同颜色/样式的小鬼图标增加多样性
- **三消机制**: 水平和垂直连线匹配（3+个图标）
- **交换系统**: 基于点击的相邻图标交换，带有流畅动画
- **重力和补充**: 消除后自动下落和顶行重新生成
- **连击系统**: 单次交换的连锁匹配，带有分数倍数

### 用户体验特性
- **实时计分**: 基于消除的分数计算的实时分数显示
- **视觉反馈**: 选择高亮、交换动画、消除效果
- **音频系统**: 消除、连击和游戏事件的音效
- **响应式设计**: 跨设备兼容性（桌面/移动/触摸）
- **游戏计时器**: 会话计时显示
- **游戏结束检测**: 当没有可能的移动时自动检测

## 架构模式

- **分层架构**: 表现层、控制层、逻辑层、数据层
- **状态机模式**: 清晰状态转换的游戏流程管理
- **事件驱动架构**: 用户交互和游戏事件处理
- **模块化组件设计**: 可维护和可扩展的代码结构

## 浏览器支持

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- 移动浏览器（iOS Safari, Chrome Mobile）

## 开发指南

### 代码约定

- **文件命名**: 类文件使用PascalCase，工具模块使用camelCase
- **模块系统**: ES6模块导入/导出
- **基于属性的测试**: 每个正确性属性最少100次迭代
- **测试注释**: 必须引用设计文档属性

### 性能优化

- **DOM基础渲染**: 比Canvas更好的响应式支持
- **CSS硬件加速**: GPU加速动画
- **高效算法**: 基于DFS的匹配，O(n)复杂度
- **内存管理**: 事件监听器和定时器的正确清理

## 许可证

MIT License - 详见LICENSE文件
# 设计文档

## 概述

小鬼消消乐是一个基于现代Web技术的消除类游戏，采用HTML5、CSS3和JavaScript实现。游戏使用DOM操作结合CSS动画来提供流畅的用户体验，通过模块化的架构设计确保代码的可维护性和可扩展性。

游戏核心采用状态机模式管理游戏流程，使用事件驱动的架构处理用户交互，并通过高效的匹配算法确保游戏性能。设计重点关注跨设备兼容性和用户体验优化。

## 架构

### 整体架构

游戏采用分层架构设计：

```
┌─────────────────────────────────────┐
│           表现层 (UI Layer)          │
│  ┌─────────────┐  ┌─────────────┐   │
│  │  游戏界面   │  │  音效管理   │   │
│  └─────────────┘  └─────────────┘   │
├─────────────────────────────────────┤
│          控制层 (Control Layer)      │
│  ┌─────────────┐  ┌─────────────┐   │
│  │  游戏控制器 │  │  输入处理   │   │
│  └─────────────┘  └─────────────┘   │
├─────────────────────────────────────┤
│           逻辑层 (Logic Layer)       │
│  ┌─────────────┐  ┌─────────────┐   │
│  │  游戏引擎   │  │  匹配算法   │   │
│  └─────────────┘  └─────────────┘   │
├─────────────────────────────────────┤
│           数据层 (Data Layer)        │
│  ┌─────────────┐  ┌─────────────┐   │
│  │  游戏状态   │  │  配置数据   │   │
│  └─────────────┘  └─────────────┘   │
└─────────────────────────────────────┘
```

### 技术栈选择

- **渲染**: DOM + CSS3 (选择原因：更好的响应式支持，CSS动画性能优异)
- **状态管理**: 自定义状态机 (轻量级，专门针对游戏逻辑优化)
- **动画**: CSS Transitions + JavaScript控制 (硬件加速，流畅体验)
- **音频**: Web Audio API (更好的音效控制)
- **存储**: localStorage (保存游戏设置和最高分)

## 组件和接口

### 核心组件

#### 1. GameEngine (游戏引擎)
```javascript
class GameEngine {
  constructor(config)
  initialize()
  start()
  pause()
  resume()
  reset()
  update()
  handleInput(input)
}
```

#### 2. GameBoard (游戏板)
```javascript
class GameBoard {
  constructor(width, height)
  initializeGrid()
  getCell(x, y)
  setCell(x, y, ghost)
  swapCells(pos1, pos2)
  findMatches()
  removeMatches(matches)
  applyGravity()
  fillEmpty()
}
```

#### 3. GhostRenderer (渲染器)
```javascript
class GhostRenderer {
  constructor(container)
  renderBoard(board)
  animateSwap(pos1, pos2)
  animateMatch(matches)
  animateFall(movements)
  updateScore(score)
}
```

#### 4. InputHandler (输入处理)
```javascript
class InputHandler {
  constructor(gameEngine)
  handleClick(event)
  handleTouch(event)
  handleKeyboard(event)
  validateMove(from, to)
}
```

#### 5. AudioManager (音频管理)
```javascript
class AudioManager {
  constructor()
  loadSounds()
  playMatch()
  playCombo()
  playSwap()
  playGameOver()
  setVolume(level)
}
```

### 数据接口

#### Ghost (小鬼对象)
```javascript
interface Ghost {
  type: number;     // 小鬼类型 (0-4)
  color: string;    // 颜色标识
  sprite: string;   // 精灵图标识
  x: number;        // 网格X坐标
  y: number;        // 网格Y坐标
}
```

#### GameState (游戏状态)
```javascript
interface GameState {
  board: Ghost[][];
  score: number;
  moves: number;
  combo: number;
  isPlaying: boolean;
  selectedCell: {x: number, y: number} | null;
  animating: boolean;
}
```

## 数据模型

### 游戏板数据结构

游戏使用二维数组表示8x8的游戏板：

```javascript
// 游戏板结构
const board = [
  [ghost, ghost, ghost, ...], // 第0行
  [ghost, ghost, ghost, ...], // 第1行
  ...
];

// 小鬼类型定义
const GHOST_TYPES = {
  RED: 0,
  BLUE: 1, 
  GREEN: 2,
  YELLOW: 3,
  PURPLE: 4
};
```

### 匹配检测算法

使用深度优先搜索(DFS)检测匹配：

```javascript
function findMatches(board) {
  const matches = [];
  const visited = new Set();
  
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (!visited.has(`${x},${y}`)) {
        const match = findConnectedGhosts(board, x, y, visited);
        if (match.length >= 3) {
          matches.push(match);
        }
      }
    }
  }
  
  return matches;
}
```

### 分数计算系统

```javascript
function calculateScore(matchSize, comboMultiplier) {
  const baseScore = matchSize * 10;
  const comboBonus = comboMultiplier * 5;
  return baseScore + comboBonus;
}
```
##
 正确性属性

*属性是应该在系统的所有有效执行中保持为真的特征或行为——本质上是关于系统应该做什么的正式声明。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*

基于需求分析，以下是关键的正确性属性：

### 属性 1: 游戏板完整填充
*对于任何*初始化的游戏板，所有网格位置都应该包含有效的小鬼图标，不存在空位置
**验证: 需求 1.2**

### 属性 2: 初始状态无匹配
*对于任何*新生成的游戏板，不应该存在三个或更多相同图标的水平或垂直连线
**验证: 需求 1.3**

### 属性 3: 相邻交换有效性
*对于任何*两个相邻的游戏板位置，交换操作后这两个位置的图标应该互换位置
**验证: 需求 2.2**

### 属性 4: 选择状态一致性
*对于任何*游戏状态，最多只能有一个图标处于选中状态
**验证: 需求 2.1, 2.3**

### 属性 5: 无效交换回滚
*对于任何*不能形成匹配的交换操作，游戏板应该恢复到交换前的状态
**验证: 需求 2.5**

### 属性 6: 匹配检测准确性
*对于任何*包含三个或更多相同图标连线的游戏板，匹配检测算法应该正确识别所有匹配
**验证: 需求 3.1, 3.2**

### 属性 7: 匹配消除完整性
*对于任何*检测到的匹配，所有匹配的图标都应该从游戏板上被移除
**验证: 需求 3.3**

### 属性 8: 分数计算正确性
*对于任何*消除操作，分数增加应该等于消除图标数量乘以基础分值加上连击奖励
**验证: 需求 3.4**

### 属性 9: 重力系统一致性
*对于任何*有空位的游戏板，重力应用后所有图标都应该向下移动到最低可能位置
**验证: 需求 4.1**

### 属性 10: 补充机制完整性
*对于任何*应用重力后的游戏板，所有空位都应该被新的随机图标填充
**验证: 需求 4.2**

### 属性 11: 连锁反应检测
*对于任何*补充完成后的游戏板，如果形成新匹配，系统应该自动检测并处理
**验证: 需求 4.3, 4.4**

### 属性 12: 游戏结束检测
*对于任何*没有可能移动的游戏板，系统应该正确检测游戏结束状态
**验证: 需求 5.5**

### 属性 13: 音效触发一致性
*对于任何*游戏事件（消除、连击、游戏结束），相应的音效应该被正确触发
**验证: 需求 7.1, 7.2, 7.5**

## 错误处理

### 输入验证
- **无效坐标**: 检查所有坐标是否在游戏板范围内 (0-7)
- **空图标操作**: 防止对空位置进行操作
- **重复选择**: 处理玩家重复点击同一图标的情况
- **动画期间输入**: 在动画播放期间禁用用户输入

### 状态异常处理
- **游戏板损坏**: 检测并修复游戏板数据不一致
- **无限循环**: 防止匹配检测和重力应用中的无限循环
- **内存泄漏**: 正确清理事件监听器和定时器
- **音频加载失败**: 优雅降级，游戏在无音效情况下继续运行

### 浏览器兼容性
- **API不支持**: 检测并提供Web Audio API的降级方案
- **CSS动画不支持**: 提供JavaScript动画作为后备
- **触摸事件不支持**: 在非触摸设备上禁用触摸相关功能

## 测试策略

### 双重测试方法

游戏将采用单元测试和基于属性的测试相结合的方法：

- **单元测试**验证具体示例、边界情况和错误条件
- **基于属性的测试**验证应该在所有输入中保持的通用属性
- 两者结合提供全面覆盖：单元测试捕获具体错误，属性测试验证一般正确性

### 单元测试要求

单元测试将覆盖：
- 游戏初始化的具体示例
- 边界条件（如游戏板边缘的操作）
- 错误条件（如无效输入的处理）
- 组件间的集成点

### 基于属性的测试要求

- 使用**fast-check**库进行JavaScript的基于属性测试
- 每个属性测试配置为运行最少100次迭代
- 每个基于属性的测试必须用注释明确引用设计文档中的正确性属性
- 测试标签格式：'**Feature: ghost-match-game, Property {number}: {property_text}**'
- 每个正确性属性必须由单个基于属性的测试实现

### 测试数据生成

为属性测试创建智能生成器：
- **游戏板生成器**: 创建有效的8x8游戏板
- **匹配场景生成器**: 生成包含特定匹配模式的游戏板
- **移动序列生成器**: 生成有效的玩家移动序列
- **边界条件生成器**: 专门生成边界情况的测试数据

### 性能测试

- **匹配检测性能**: 确保大量匹配时算法效率
- **动画性能**: 验证60fps的动画流畅度
- **内存使用**: 监控长时间游戏的内存消耗
- **移动设备性能**: 在低端设备上的性能验证
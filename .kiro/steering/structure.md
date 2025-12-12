# Project Structure

## Directory Organization

```
/
├── index.html              # Main game entry point with 8x8 grid container
├── css/
│   ├── main.css           # Core game styles, grid layout, ghost icons
│   ├── animations.css     # Swap, elimination, falling animations
│   └── responsive.css     # Mobile/desktop adaptive layouts
├── js/
│   ├── core/
│   │   ├── GameEngine.js     # State machine, game loop, session management
│   │   ├── GameBoard.js      # 8x8 grid data structure, cell operations
│   │   └── GameState.js      # Score, timer, combo tracking
│   ├── components/
│   │   ├── GhostRenderer.js  # DOM rendering, visual feedback, animations
│   │   ├── InputHandler.js   # Click/touch events, selection, swap validation
│   │   └── AudioManager.js   # Sound effects for eliminations and combos
│   ├── algorithms/
│   │   ├── MatchDetector.js  # DFS-based horizontal/vertical match detection
│   │   └── GravitySystem.js  # Falling logic, refill mechanics
│   ├── constants.js       # Ghost types, scoring rules, game config
│   └── main.js            # Application initialization and setup
├── assets/
│   ├── images/            # 5+ ghost type sprites, UI elements
│   └── sounds/            # Elimination, combo, game over audio files
├── tests/
│   ├── unit/              # Component-specific functionality tests
│   ├── property/          # fast-check property-based tests (100+ iterations)
│   └── integration/       # Full game session flow tests
└── .kiro/
    ├── specs/             # Requirements, design, tasks documentation
    └── steering/          # Project guidance and conventions
```

## Architecture Components

### Core System Classes
- **GameEngine**: Central coordinator managing game states (playing, paused, ended)
- **GameBoard**: 8x8 grid with ghost placement, swap operations, match detection
- **GameState**: Score calculation, combo tracking, timer management
- **GhostRenderer**: DOM updates, selection highlighting, animation triggers
- **InputHandler**: Click/touch processing, adjacency validation, selection management
- **AudioManager**: Sound effect coordination for game events

### Algorithm Modules
- **MatchDetector**: DFS-based detection of 3+ horizontal/vertical matches
- **GravitySystem**: Post-elimination falling and top-row refill logic

### Data Flow Architecture
1. **Input Processing**: InputHandler → selection/swap validation → GameEngine
2. **Game Logic**: GameEngine → GameBoard operations → match detection
3. **Visual Updates**: GameBoard changes → GhostRenderer → DOM/CSS animations
4. **Audio Feedback**: Game events → AudioManager → sound effect playback
5. **State Management**: All operations → GameState → score/timer updates

## Coding Conventions

### File Naming
- **PascalCase**: Class files (GameEngine.js, MatchDetector.js)
- **camelCase**: Utility modules (constants.js, main.js)
- **kebab-case**: CSS files (main.css, responsive.css)
- **lowercase**: HTML and asset files

### Module System
```javascript
// ES6 module exports
export class GameBoard { /* ... */ }
export const GHOST_TYPES = { /* ... */ };

// Explicit imports
import { GameBoard } from './core/GameBoard.js';
import { GHOST_TYPES } from './constants.js';
```

### Property-Based Testing Requirements
- Each correctness property must have dedicated test file
- Minimum 100 iterations per property test
- Test comments must reference design document properties
- Format: `// Property X: [property description] - Verifies: Requirement Y.Z`
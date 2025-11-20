# 🎲 Dice Component - Complete Integration Guide

## ✅ Implementation Summary

### 1. **Dice Dot Patterns** (Using Grid of Divs)
Each face uses a 3×3 CSS Grid layout with positioned dots:

- **Face 1**: Center dot only
- **Face 2**: Top-left, bottom-right
- **Face 3**: Top-left, center, bottom-right  
- **Face 4**: Four corners
- **Face 5**: Four corners + center
- **Face 6**: Two columns of 3 dots each (left and right columns)

```jsx
// Grid positioning system
const positions = {
  'top-left': 'col-start-1 row-start-1',
  'top-right': 'col-start-3 row-start-1',
  'center': 'col-start-2 row-start-2',
  'bottom-left': 'col-start-1 row-start-3',
  'bottom-right': 'col-start-3 row-start-3',
  // Two columns for face 6
  'left-top': 'col-start-1 row-start-1',
  'left-middle': 'col-start-1 row-start-2',
  'left-bottom': 'col-start-1 row-start-3',
  'right-top': 'col-start-3 row-start-1',
  'right-middle': 'col-start-3 row-start-2',
  'right-bottom': 'col-start-3 row-start-3',
};
```

### 2. **CSS Animations**

#### Roll Animation
```css
@keyframes roll {
  /* Rotates on X, Y, Z axes randomly */
  /* Duration: 2 seconds */
  /* Timing: ease-in-out */
  0% {
    transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg);
  }
  12.5% {
    transform: rotateX(135deg) rotateY(105deg) rotateZ(60deg);
  }
  25% {
    transform: rotateX(270deg) rotateY(190deg) rotateZ(120deg);
  }
  37.5% {
    transform: rotateX(405deg) rotateY(285deg) rotateZ(180deg);
  }
  50% {
    transform: rotateX(540deg) rotateY(370deg) rotateZ(240deg);
  }
  62.5% {
    transform: rotateX(675deg) rotateY(465deg) rotateZ(300deg);
  }
  75% {
    transform: rotateX(810deg) rotateY(550deg) rotateZ(360deg);
  }
  87.5% {
    transform: rotateX(945deg) rotateY(645deg) rotateZ(420deg);
  }
  100% {
    transform: rotateX(1080deg) rotateY(720deg) rotateZ(480deg);
  }
}
```

#### Final Position Based on Result Number
Each number has specific rotation angles to face forward:

```javascript
const rotations = {
  1: 'rotateX(0deg) rotateY(0deg)',        // front face
  2: 'rotateX(0deg) rotateY(180deg)',      // back face
  3: 'rotateX(0deg) rotateY(-90deg)',      // right face
  4: 'rotateX(0deg) rotateY(90deg)',       // left face
  5: 'rotateX(-90deg) rotateY(0deg)',      // top face
  6: 'rotateX(90deg) rotateY(0deg)',       // bottom face
};
```

### 3. **Animation States** (Props-Based)

The component accepts two props that control the animation:

```jsx
<Dice 
  value={diceResult}        // null | 1-6 | '?'
  isRolling={isRolling}     // boolean
/>
```

**State Behavior:**
- **`idle`**: When `value` is null or '?' and `isRolling` is false
  - Shows last result or default face
  - Subtle floating animation
  
- **`rolling`**: When `isRolling` is true
  - Continuous 3D rotation animation
  - 2 seconds per cycle with ease-in-out timing
  - Rotates randomly on X, Y, Z axes
  
- **`result`**: When `value` is 1-6 and `isRolling` is false
  - Rotates to show specific face forward
  - Glowing drop-shadow effect
  - Smooth 2-second transition

### 4. **Integration in GameBoard**

#### Import the Component
```jsx
import Dice from './Dice';
```

#### State Management
```jsx
const [diceResult, setDiceResult] = useState(null);
const [isRolling, setIsRolling] = useState(false);
```

#### Render the Dice
```jsx
<Dice 
  value={diceResult === null || diceResult === '?' ? null : diceResult}
  isRolling={isRolling || isPlacingBet}
/>
```

#### Trigger Rolling on Bet Placement
```jsx
const handlePlaceBet = async () => {
  // Start rolling animation
  setIsRolling(true);
  setDiceResult('?');
  
  try {
    const result = await placeBet(selectedNumber, betAmount);
    
    if (result.success) {
      // Stop rolling and show result from smart contract
      setTimeout(() => {
        setDiceResult(result.result);  // Result from smart contract
        setIsRolling(false);
      }, 2000); // Match animation duration
    }
  } catch (error) {
    setIsRolling(false);
    setDiceResult(null);
  }
};
```

### 5. **Complete Flow**

```
1. User clicks "Place Bet"
   ↓
2. Set isRolling = true
   → Dice enters 'rolling' state
   → Continuous 3D rotation animation starts
   ↓
3. Smart contract processes bet
   ↓
4. After 2 seconds (or when result received):
   - Set diceResult = smart contract result (1-6)
   - Set isRolling = false
   ↓
5. Dice enters 'result' state
   → Rotates to show specific face
   → Displays winning/losing number
   ↓
6. When idle:
   - Dice shows last result with floating animation
```

### 6. **Key Features**

✅ **3D Cube Construction**: Six faces positioned in 3D space  
✅ **Proper Dot Patterns**: Standard dice faces with grid-based positioning  
✅ **Smooth Animations**: CSS keyframes with ease-in-out timing  
✅ **State-Driven**: Props control animation behavior  
✅ **Smart Contract Integration**: Displays blockchain results  
✅ **Visual Feedback**: Different states for idle/rolling/result  
✅ **Responsive**: Works across different screen sizes  

### 7. **Customization Options**

You can easily customize:
- Animation duration (default: 2s)
- Dice size (default: 150px)
- Colors and borders
- Dot sizes and colors
- Rotation speeds and patterns

## 🎯 Usage Example

```jsx
// Simple usage
<Dice value={3} isRolling={false} />

// Rolling state
<Dice value={null} isRolling={true} />

// Idle state (shows last result)
<Dice value={5} isRolling={false} />
```

## 📦 Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `null \| 1-6 \| '?'` | `null` | The face to display (null = idle) |
| `isRolling` | `boolean` | `false` | Whether dice is currently rolling |

---

**Status**: ✅ Fully Implemented and Integrated

# 🐍 Snake Hub

A classic Snake game built with React, TypeScript, and HTML5 Canvas. Features multiple difficulty levels, progressive speed increases, sound effects, and persistent high scores.

## ✨ Features

- **Three Difficulty Levels**: Easy, Medium, and Hard with different initial speeds and acceleration rates
- **Progressive Difficulty**: Game speed increases as you eat more apples
- **Persistent High Score**: Your best score is saved in browser localStorage
- **Sound Effects**: Retro-style sound effects for eating apples and game over (with mute option)
- **Pause/Resume**: Press Escape or click the pause button to pause the game
- **Responsive Design**: Clean, modern UI built with Tailwind CSS
- **Smooth Animations**: Canvas-based rendering with visual snake eyes that follow direction
- **Collision Detection**: Accurate wall and self-collision detection

## 🎮 How to Play

- Use **Arrow Keys** (↑ ↓ ← →) to control the snake's direction
- Press **Escape** or click the **Pause Button** to pause/resume
- Eat the red apples to grow longer and increase your score
- Avoid hitting walls or your own tail
- Try to beat your high score!

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```
git clone https://github.com/mrpawarGit/GameQuest.git
cd react-snake-game
```

2. Install dependencies:
```
npm install
```

3. Start the development server:
```
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```
npm run build
```

The optimized build will be generated in the `dist` folder.

### Preview Production Build

```
npm run preview
```

## 📁 Project Structure

```
snake-hub/
├── index.html          # HTML entry point
├── index.tsx           # React entry point
├── App.tsx             # Main game component
├── types.ts            # TypeScript type definitions
├── constants.ts        # Game configuration constants
├── package.json        # Project dependencies
├── vite.config.ts      # Vite configuration
└── tsconfig.json       # TypeScript configuration
```

## 🎯 Game Mechanics

### Difficulty Settings

| Difficulty | Initial Speed | Speed Increment | Min Speed |
|------------|---------------|-----------------|-----------|
| Easy       | 200ms         | 5ms per apple   | 50ms      |
| Medium     | 150ms         | 7ms per apple   | 50ms      |
| Hard       | 100ms         | 10ms per apple  | 50ms      |

### Scoring

- Each apple eaten = +1 point
- Speed increases with each apple, making the game progressively harder
- High score persists across game sessions

## 🛠️ Technologies Used

- **React 19.2.0** - UI framework
- **TypeScript 5.8.2** - Type-safe JavaScript
- **Vite 6.2.0** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **HTML5 Canvas** - Game rendering
- **Web Audio API** - Sound effects

## 🎨 Customization

### Modify Game Board Size

Edit `constants.ts`:
```
export const BOARD_SIZE = 20;  // Change grid size
export const TILE_SIZE = 25;   // Change tile pixel size
```

### Adjust Difficulty Settings

Edit `constants.ts`:
```
export const DIFFICULTY_SETTINGS: Record<
  Difficulty,
  { speed: number; increment: number }
> = {
  Easy: { speed: 200, increment: 5 },
  // Customize values here
};
```

### Change Colors

Edit the Canvas rendering section in `App.tsx`:
```
ctx.fillStyle = "#48bb78"; // Snake head color
ctx.fillStyle = "#38a169"; // Snake body color
ctx.fillStyle = "#f56565"; // Apple color
```

## 🐛 Known Issues

- None currently. Please report any bugs you find!

## 🤝 Contributions

Contributions are welcome! Please feel free to submit a Pull Request.

- [**Mayur**](https://github.com/mrpawarGit)

- [**Shweta**](https://github.com/Shwetaaa-coder)

- [**Manikanta**](https://github.com/kmanikanta9)
  
- [**Amutha**](https://github.com/amutharaj0597)


## 🙏 Acknowledgments

- Inspired by the classic Nokia Snake game
- Built as a learning project for React and TypeScript
- Sound effects created using Web Audio API

---

⭐ Star this repo if you found it helpful!

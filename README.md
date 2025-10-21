# 🐍 Snake Hub

A modern, feature-rich Snake game built with React, TypeScript, HTML5 Canvas, and Firebase. Play the classic game with cloud-synced high scores, optional authentication, and a beautiful responsive interface.

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/ffc01b05-4711-4b8a-94dc-c4e0967457f7" />


### Gameplay
- **Three Difficulty Levels**: Easy, Medium, and Hard with different speeds and acceleration
- **Progressive Difficulty**: Game speed increases as you eat more apples
- **Responsive Controls**: Arrow Keys and WASD support
- **Pause/Resume**: Press ESC or click the pause button anytime
- **Sound Effects**: Retro-style audio with mute toggle
- **Smooth Animations**: Canvas-based rendering with directional snake eyes

### Authentication & Cloud Features
- **Firebase Authentication**: Sign in with Google
- **Guest Mode**: Play without signing in
- **Cloud High Scores**: Synced across devices for logged-in users
- **Local Storage Fallback**: Guest scores saved locally
- **User Profiles**: Display name and profile picture in navbar

### UI/UX
- **Fully Responsive Design**: Works on mobile, tablet, and desktop
- **Modern Interface**: Clean design with Tailwind CSS
- **Loading Screen**: Animated 2-second loading on launch
- **Login Screen**: Optional authentication flow
- **Sticky Navbar**: Logo, user profile, and logout button
- **Score Display**: Real-time score and high score tracking
- **Instructions Card**: Clear controls and gameplay info
- **Footer**: Credits and links

## 🎮 How to Play

- Use **Arrow Keys** (↑ ↓ ← →) or **WASD** to control the snake
- Press **ESC** or click the **⏸️ Pause Button** to pause/resume
- Eat red apples to grow longer and increase your score
- Avoid hitting walls or your own tail
- Beat your high score and compete globally!

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account (for authentication features)

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/mrpawarGit/GameQuest.git
cd GameQuest/react-snake-game
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up Firebase**:
   - Create a project at [Firebase Console](https://console.firebase.google.com/)
   - Enable **Authentication** → **Google Sign-in**
   - Enable **Firestore Database**
   - Copy your Firebase config

4. **Configure environment variables**:

Create a `.env` file in the root directory:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id
```

5. **Start the development server**:
```bash
npm run dev
```

6. Open your browser and navigate to `http://localhost:3000`


### Build for Production

```bash
npm run build
```

The optimized build will be generated in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
react-snake-game/
├── public/
│   └── logo.png           # Game logo/favicon
├── index.html             # HTML entry point
├── index.tsx              # React entry point
├── App.tsx                # Main game component
├── AuthContext.tsx        # Authentication context provider
├── LoadingScreen.tsx      # Initial loading screen
├── LoginScreen.tsx        # Authentication screen
├── firebase.ts            # Firebase configuration
├── types.ts               # TypeScript type definitions
├── constants.ts           # Game configuration
├── vite-env.d.ts          # Vite environment types
├── .env                   # Environment variables (create this)
├── .env.example           # Environment template
├── package.json           # Dependencies
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── tsconfig.node.json     # Node TypeScript config
```

## 🎯 Game Mechanics

### Difficulty Settings

| Difficulty | Initial Speed | Speed Increment | Min Speed | Description |
|------------|---------------|-----------------|-----------|-------------|
| Easy       | 200ms         | 5ms per apple   | 50ms      | Chill vibes |
| Medium     | 150ms         | 7ms per apple   | 50ms      | Balanced    |
| Hard       | 100ms         | 10ms per apple  | 50ms      | Pro mode    |

### Scoring System

- Each apple eaten = **+1 point**
- Speed increases with each apple (progressive difficulty)
- High scores saved to:
  - **Cloud (Firebase)** - for authenticated users
  - **localStorage** - for guest players
- Leaderboard-ready architecture

## 🛠️ Technologies Used

### Frontend
- **React 19.2.0** - Modern UI framework
- **TypeScript 5.8.2** - Type-safe development
- **Vite 6.2.0** - Lightning-fast build tool
- **Tailwind CSS 3.4+** - Utility-first styling
- **HTML5 Canvas** - High-performance game rendering

### Backend & Services
- **Firebase Authentication** - Google OAuth
- **Cloud Firestore** - NoSQL database for scores
- **Web Audio API** - Retro sound effects

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting (recommended)
- **Git** - Version control

## 🎨 Customization

### Modify Board Size & Responsiveness

Edit `constants.ts`:
```typescript
export const getResponsiveBoardSize = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  const availableWidth = Math.min(width - 100, 800);
  const availableHeight = Math.min(height - 300, 800);
  
  // Customize max size
  const maxSize = Math.min(availableWidth, availableHeight);
  
  const tileSize = Math.floor(maxSize / 25);
  const boardSize = Math.floor(maxSize / tileSize);
  
  return { boardSize, tileSize, canvasWidth, canvasHeight };
};
```

### Adjust Difficulty

Edit `constants.ts`:
```typescript
export const DIFFICULTY_SETTINGS: Record<
  Difficulty,
  { speed: number; increment: number }
> = {
  Easy: { speed: 200, increment: 5 },
  Medium: { speed: 150, increment: 7 },
  Hard: { speed: 100, increment: 10 },
};
```

### Change Colors & Theme

Edit canvas rendering in `App.tsx`:
```typescript
// Snake colors
ctx.fillStyle = "#48bb78"; // Head (green-500)
ctx.fillStyle = "#38a169"; // Body (green-600)

// Apple color
ctx.fillStyle = "#f56565"; // Red-400

// Background
ctx.fillStyle = "#1a202c"; // Gray-900
```

### Customize Logo

Replace `/public/logo.png` with your own image (recommended: 512x512px PNG)

## 🔒 Security Best Practices

- ✅ Environment variables in `.env` (never commit)
- ✅ `.env` added to `.gitignore`
- ✅ Firebase security rules implemented
- ✅ User data isolated per user ID
- ✅ Client-side validation
- ✅ HTTPS required for production

## 📱 Responsive Breakpoints

- **Mobile**: 320px - 640px
- **Tablet**: 641px - 1024px
- **Desktop**: 1025px+

The game automatically adjusts canvas size, UI elements, and touch controls based on viewport.

## 🐛 Known Issues & Limitations

- Audio might require user interaction on some browsers (autoplay policy)
- Firestore free tier has usage limits (10K writes/day)

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contributors

- [**Mayur Pawar**](https://github.com/mrpawarGit) 
- [**Shweta**](https://github.com/Shwetaaa-coder) 
- [**Manikanta**](https://github.com/kmanikanta9) 
- [**Amutha**](https://github.com/amutharaj0597)

## 📝 Future Enhancements

- [ ] Mobile swipe controls
- [ ] Global leaderboard
- [ ] Power-ups (speed boost, invincibility, etc.)
- [ ] Multiple game modes (time trial, survival)
- [ ] Obstacles and special apples
- [ ] Multiplayer support
- [ ] Daily challenges
- [ ] Achievement system
- [ ] Theme customization
- [ ] PWA support

## 📄 License

This project is open source.

## 🙏 Acknowledgments

- Inspired by the classic Nokia Snake game
- Built as a modern take on retro gaming
- Firebase for authentication and database services
- React and Vite communities for excellent tooling
- All contributors and players!

## 🎮 Ready to Play?

```bash
npm install
# Set up .env file
npm run dev
```

**⭐ Star this repo if you enjoyed the game!**

Made with ❤️ by the Snake Hub Team

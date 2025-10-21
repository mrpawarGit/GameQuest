import React, { useState, useEffect, useRef, useCallback } from "react";
import { Point, Direction, Difficulty } from "./types";
import { useAuth } from "./AuthContext";
import { saveHighScore, getUserHighScore, logOut } from "./firebase";
import LoadingScreen from "./LoadingScreen";
import LoginScreen from "./LoginScreen";
import {
  getResponsiveBoardSize,
  INITIAL_SNAKE_POSITION,
  INITIAL_APPLE_POSITION,
  INITIAL_DIRECTION,
  DIFFICULTY_SETTINGS,
  MIN_SPEED,
  HIGH_SCORE_STORAGE_KEY,
} from "./constants";

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const { user, isGuest } = useAuth();
  const [showLoading, setShowLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Responsive board dimensions
  const [boardConfig, setBoardConfig] = useState(getResponsiveBoardSize());
  const { boardSize, tileSize, canvasWidth, canvasHeight } = boardConfig;

  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE_POSITION);
  const [apple, setApple] = useState<Point>(INITIAL_APPLE_POSITION);
  const directionRef = useRef<Direction>(INITIAL_DIRECTION);
  const [speed, setSpeed] = useState<number>(200);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!difficulty) {
        setBoardConfig(getResponsiveBoardSize());
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [difficulty]);

  // Load high score on mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem(HIGH_SCORE_STORAGE_KEY);
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  // Load user's cloud high score
  useEffect(() => {
    if (user && !isGuest) {
      getUserHighScore(user.uid).then((score) => {
        if (score > highScore) {
          setHighScore(score);
        }
      });
    }
  }, [user, isGuest, highScore]);

  // Save high score when game ends
  useEffect(() => {
    if (isGameOver && score > highScore) {
      setHighScore(score);
      localStorage.setItem(HIGH_SCORE_STORAGE_KEY, score.toString());

      // Save to Firebase if user is logged in
      if (user && !isGuest) {
        saveHighScore(user.uid, score, user.displayName || "Player");
      }
    }
  }, [isGameOver, score, highScore, user, isGuest]);

  const playSound = useCallback(
    (type: "eat" | "gameOver") => {
      if (isMuted || !audioCtxRef.current) return;

      const audioCtx = audioCtxRef.current;
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

      if (type === "eat") {
        oscillator.type = "square";
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.00001,
          audioCtx.currentTime + 0.1
        );
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.1);
      } else if (type === "gameOver") {
        oscillator.type = "sawtooth";
        oscillator.frequency.setValueAtTime(220, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          55,
          audioCtx.currentTime + 0.5
        );
        gainNode.gain.exponentialRampToValueAtTime(
          0.00001,
          audioCtx.currentTime + 0.5
        );
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.5);
      }
    },
    [isMuted]
  );

  const createRandomApple = useCallback(
    (currentSnake: Point[]): Point => {
      let attempts = 0;
      const maxAttempts = 1000;

      while (attempts < maxAttempts) {
        const newApple = {
          x: Math.floor(Math.random() * boardSize),
          y: Math.floor(Math.random() * boardSize),
        };
        if (
          !currentSnake.some(
            (segment) => segment.x === newApple.x && segment.y === newApple.y
          )
        ) {
          return newApple;
        }
        attempts++;
      }

      return { x: boardSize - 5, y: boardSize - 5 };
    },
    [boardSize]
  );

  const resetToMenu = () => {
    setDifficulty(null);
    setIsGameOver(false);
    setScore(0);
    setSnake(INITIAL_SNAKE_POSITION);
    setApple(INITIAL_APPLE_POSITION);
    setIsPaused(false);
    setBoardConfig(getResponsiveBoardSize());
  };

  const startGame = useCallback(
    (selectedDifficulty: Difficulty) => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }

      setDifficulty(selectedDifficulty);
      setSpeed(DIFFICULTY_SETTINGS[selectedDifficulty].speed);
      setSnake(INITIAL_SNAKE_POSITION);
      setApple(createRandomApple(INITIAL_SNAKE_POSITION));
      directionRef.current = INITIAL_DIRECTION;
      setScore(0);
      setIsGameOver(false);
      setIsPaused(false);
    },
    [createRandomApple]
  );

  const togglePause = useCallback(() => {
    if (difficulty && !isGameOver) {
      setIsPaused((prev) => !prev);
    }
  }, [difficulty, isGameOver]);

  const handleLogout = async () => {
    try {
      await logOut();
      resetToMenu();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Prevent default behavior for arrow keys and space
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)
      ) {
        e.preventDefault();
      }

      if (e.key === "Escape") {
        togglePause();
        return;
      }

      const newDirection = directionRef.current;
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          if (newDirection !== Direction.DOWN)
            directionRef.current = Direction.UP;
          break;
        case "ArrowDown":
        case "s":
        case "S":
          if (newDirection !== Direction.UP)
            directionRef.current = Direction.DOWN;
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          if (newDirection !== Direction.RIGHT)
            directionRef.current = Direction.LEFT;
          break;
        case "ArrowRight":
        case "d":
        case "D":
          if (newDirection !== Direction.LEFT)
            directionRef.current = Direction.RIGHT;
          break;
      }
    },
    [togglePause]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const gameLoop = useCallback(() => {
    if (isGameOver || !difficulty || isPaused) return;

    setSnake((prevSnake) => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };

      switch (directionRef.current) {
        case Direction.UP:
          head.y -= 1;
          break;
        case Direction.DOWN:
          head.y += 1;
          break;
        case Direction.LEFT:
          head.x -= 1;
          break;
        case Direction.RIGHT:
          head.x += 1;
          break;
      }

      if (
        head.x < 0 ||
        head.x >= boardSize ||
        head.y < 0 ||
        head.y >= boardSize
      ) {
        playSound("gameOver");
        setIsGameOver(true);
        return prevSnake;
      }

      for (let i = 1; i < newSnake.length; i++) {
        if (head.x === newSnake[i].x && head.y === newSnake[i].y) {
          playSound("gameOver");
          setIsGameOver(true);
          return prevSnake;
        }
      }

      newSnake.unshift(head);

      if (head.x === apple.x && head.y === apple.y) {
        playSound("eat");
        setScore((prevScore) => prevScore + 1);
        const speedIncrement = DIFFICULTY_SETTINGS[difficulty].increment;
        setSpeed((prevSpeed) =>
          Math.max(MIN_SPEED, prevSpeed - speedIncrement)
        );
        setApple(createRandomApple(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [
    apple,
    isGameOver,
    difficulty,
    createRandomApple,
    playSound,
    isPaused,
    boardSize,
  ]);

  useEffect(() => {
    if (difficulty && !isGameOver && !isPaused) {
      const intervalId = setInterval(gameLoop, speed);
      return () => clearInterval(intervalId);
    }
  }, [gameLoop, speed, difficulty, isGameOver, isPaused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#1a202c";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? "#48bb78" : "#38a169";
      ctx.fillRect(
        segment.x * tileSize,
        segment.y * tileSize,
        tileSize,
        tileSize
      );
      ctx.strokeStyle = "#1a202c";
      ctx.strokeRect(
        segment.x * tileSize,
        segment.y * tileSize,
        tileSize,
        tileSize
      );
    });

    if (snake.length > 0) {
      const head = snake[0];
      ctx.fillStyle = "#000";
      const eyeSize = tileSize / 5;
      const eyeOffset1 = tileSize / 4;
      const eyeOffset2 = tileSize - eyeOffset1 - eyeSize;
      const headX = head.x * tileSize;
      const headY = head.y * tileSize;

      switch (directionRef.current) {
        case Direction.UP:
          ctx.fillRect(
            headX + eyeOffset1,
            headY + eyeOffset1,
            eyeSize,
            eyeSize
          );
          ctx.fillRect(
            headX + eyeOffset2,
            headY + eyeOffset1,
            eyeSize,
            eyeSize
          );
          break;
        case Direction.DOWN:
          ctx.fillRect(
            headX + eyeOffset1,
            headY + eyeOffset2,
            eyeSize,
            eyeSize
          );
          ctx.fillRect(
            headX + eyeOffset2,
            headY + eyeOffset2,
            eyeSize,
            eyeSize
          );
          break;
        case Direction.LEFT:
          ctx.fillRect(
            headX + eyeOffset1,
            headY + eyeOffset1,
            eyeSize,
            eyeSize
          );
          ctx.fillRect(
            headX + eyeOffset1,
            headY + eyeOffset2,
            eyeSize,
            eyeSize
          );
          break;
        case Direction.RIGHT:
          ctx.fillRect(
            headX + eyeOffset2,
            headY + eyeOffset1,
            eyeSize,
            eyeSize
          );
          ctx.fillRect(
            headX + eyeOffset2,
            headY + eyeOffset2,
            eyeSize,
            eyeSize
          );
          break;
      }
    }

    ctx.fillStyle = "#f56565";
    ctx.beginPath();
    ctx.arc(
      apple.x * tileSize + tileSize / 2,
      apple.y * tileSize + tileSize / 2,
      tileSize / 2.2,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }, [snake, apple, tileSize, canvasWidth, canvasHeight]);

  if (showLoading) {
    return (
      <LoadingScreen
        onComplete={() => {
          setShowLoading(false);
          setShowLogin(true);
        }}
      />
    );
  }

  if (showLogin && !isInitialized) {
    return (
      <LoginScreen
        onContinue={() => {
          setShowLogin(false);
          setIsInitialized(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-900 font-mono">
      {/* Navbar */}
      <nav className="bg-gray-800 border-b-2 border-green-500 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            {/* Logo/Title */}
            <div className="flex items-center gap-2 sm:gap-3">
              <img
                src="/logo.png"
                alt="Snake Hub Logo"
                className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10"
              />
              <h1 className="text-base sm:text-xl md:text-2xl font-bold text-green-400 tracking-wider">
                SNAKE HUB
              </h1>
            </div>

            {/* User Profile Section */}
            {(user || isGuest) && (
              <div className="flex items-center gap-2 sm:gap-3">
                {user ? (
                  <>
                    <div className="flex items-center gap-1 sm:gap-2 bg-gray-900 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-green-500/30">
                      <span className="text-xs sm:text-sm font-semibold text-white">
                        {user.displayName || "Player"}
                      </span>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-lg transition-all font-semibold text-xs sm:text-sm flex items-center gap-1 sm:gap-2"
                      title="Logout"
                    >
                      <span className="hidden sm:inline">Logout</span>
                      <span className="text-sm sm:text-base">🚪</span>
                    </button>
                  </>
                ) : (
                  <div className="bg-gray-900 px-2 sm:px-4 py-1 sm:py-2 rounded-lg border border-gray-600 flex items-center gap-1 sm:gap-2">
                    <span className="text-lg sm:text-2xl">👤</span>
                    <span className="text-xs sm:text-sm text-gray-300 font-medium">
                      Guest
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 md:p-6">
        {/* Game Stats */}
        <div className="w-full max-w-4xl mb-3 sm:mb-4">
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3">
            <div className="bg-gray-800 px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg shadow-lg">
              <div className="flex flex-col items-center">
                <span className="text-[10px] sm:text-xs text-gray-400 uppercase">
                  Score
                </span>
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-green-400">
                  {score}
                </span>
              </div>
            </div>

            <div className="bg-gray-800 px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg shadow-lg">
              <div className="flex flex-col items-center">
                <span className="text-[10px] sm:text-xs text-gray-400 uppercase">
                  Best
                </span>
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-400">
                  {highScore}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="bg-gray-800 border-2 border-green-500 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xl sm:text-2xl hover:bg-gray-700 transition-all shadow-lg active:scale-95"
              aria-label="Toggle Sound"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? "🔇" : "🔊"}
            </button>

            {difficulty && !isGameOver && (
              <button
                onClick={togglePause}
                className="bg-gray-800 border-2 border-green-500 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xl sm:text-2xl hover:bg-gray-700 transition-all shadow-lg active:scale-95"
                aria-label={isPaused ? "Resume Game" : "Pause Game"}
                title={isPaused ? "Resume" : "Pause"}
              >
                {isPaused ? "▶️" : "⏸️"}
              </button>
            )}
          </div>
        </div>

        {/* Game Board */}
        <div className="relative bg-gray-800 border-2 sm:border-4 border-green-500 shadow-2xl shadow-green-500/30 rounded-lg overflow-hidden max-w-full">
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="block max-w-full h-auto"
          />

          {isPaused && !isGameOver && (
            <div className="absolute inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center p-4">
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold text-yellow-400 animate-pulse mb-4 sm:mb-6">
                PAUSED
              </h2>
              <p className="text-white text-sm sm:text-lg md:text-xl px-4 text-center">
                Press <span className="text-green-400 font-bold">ESC</span> or
                click <span className="text-green-400 font-bold">Resume</span>
              </p>
            </div>
          )}

          {(!difficulty || isGameOver) && (
            <div className="absolute inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center p-4 sm:p-6">
              {isGameOver ? (
                <div className="text-center max-w-md">
                  <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold text-red-500 mb-3 sm:mb-4">
                    GAME OVER
                  </h2>
                  <div className="bg-gray-800 border-2 border-green-500 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
                    <p className="text-gray-400 text-xs sm:text-sm mb-2">
                      Final Score
                    </p>
                    <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-400 mb-3 sm:mb-4">
                      {score}
                    </p>
                    {score === highScore && score > 0 && (
                      <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-2 sm:p-3">
                        <p className="text-sm sm:text-base md:text-lg text-yellow-400 font-bold animate-pulse">
                          🎉 NEW HIGH SCORE! 🎉
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={resetToMenu}
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-all transform hover:scale-105 active:scale-95 text-base sm:text-lg md:text-xl shadow-lg"
                  >
                    🎮 Play Again
                  </button>
                </div>
              ) : (
                <div className="text-center max-w-md w-full">
                  <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-green-400 mb-4 sm:mb-6 md:mb-8">
                    Choose Difficulty
                  </h2>
                  <div className="flex flex-col gap-3 sm:gap-4">
                    <button
                      onClick={() => startGame("Easy")}
                      className="group px-6 sm:px-8 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 active:scale-95 text-base sm:text-lg md:text-xl shadow-lg"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span>Easy</span>
                        <span className="text-xs sm:text-sm opacity-75 group-hover:opacity-100">
                          Chill vibes
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={() => startGame("Medium")}
                      className="group px-6 sm:px-8 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all transform hover:scale-105 active:scale-95 text-base sm:text-lg md:text-xl shadow-lg"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span>Medium</span>
                        <span className="text-xs sm:text-sm opacity-75 group-hover:opacity-100">
                          Balanced
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={() => startGame("Hard")}
                      className="group px-6 sm:px-8 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-lg hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 active:scale-95 text-base sm:text-lg md:text-xl shadow-lg"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span>Hard</span>
                        <span className="text-xs sm:text-sm opacity-75 group-hover:opacity-100">
                          Pro mode
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-4 sm:mt-6 bg-gray-800 border border-gray-700 rounded-lg p-3 sm:p-4 max-w-md w-full">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl">⌨️</span>
              <div>
                <p className="text-gray-400 text-[10px] sm:text-xs">Controls</p>
                <p className="text-white font-semibold text-xs sm:text-sm">
                  Arrows/WASD
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl">⏸️</span>
              <div>
                <p className="text-gray-400 text-[10px] sm:text-xs">Pause</p>
                <p className="text-white font-semibold text-xs sm:text-sm">
                  ESC Key
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 py-3 sm:py-4 text-center px-4">
        <p className="text-gray-400 text-xs sm:text-sm">
          Made with <span className="text-red-500">❤️</span> by{" "}
          <a
            href="https://github.com/mrpawarGit/GameQuest"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-500 hover:text-green-400 font-semibold transition-colors"
          >
            SNAKE HUB
          </a>
        </p>
      </footer>
    </div>
  );
};

export default App;

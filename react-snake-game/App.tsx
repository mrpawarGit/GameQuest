import React, { useState, useEffect, useRef, useCallback } from "react";
import { Point, Direction, Difficulty } from "./types";
import {
  BOARD_SIZE,
  TILE_SIZE,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
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

  useEffect(() => {
    const savedHighScore = localStorage.getItem(HIGH_SCORE_STORAGE_KEY);
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  useEffect(() => {
    if (isGameOver && score > highScore) {
      setHighScore(score);
      localStorage.setItem(HIGH_SCORE_STORAGE_KEY, score.toString());
    }
  }, [isGameOver, score, highScore]);

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

  const createRandomApple = useCallback((currentSnake: Point[]): Point => {
    while (true) {
      const newApple = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE),
      };
      if (
        !currentSnake.some(
          (segment) => segment.x === newApple.x && segment.y === newApple.y
        )
      ) {
        return newApple;
      }
    }
  }, []);

  const resetToMenu = () => {
    setDifficulty(null);
    setIsGameOver(false);
    setScore(0);
    setSnake(INITIAL_SNAKE_POSITION);
    setApple(INITIAL_APPLE_POSITION);
    setIsPaused(false);
  };

  const startGame = useCallback(
    (selectedDifficulty: Difficulty) => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
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

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        togglePause();
        return;
      }

      const newDirection = directionRef.current;
      switch (e.key) {
        case "ArrowUp":
          if (newDirection !== Direction.DOWN)
            directionRef.current = Direction.UP;
          break;
        case "ArrowDown":
          if (newDirection !== Direction.UP)
            directionRef.current = Direction.DOWN;
          break;
        case "ArrowLeft":
          if (newDirection !== Direction.RIGHT)
            directionRef.current = Direction.LEFT;
          break;
        case "ArrowRight":
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
        head.x >= BOARD_SIZE ||
        head.y < 0 ||
        head.y >= BOARD_SIZE
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
  }, [apple, isGameOver, difficulty, createRandomApple, playSound, isPaused]);

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
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? "#48bb78" : "#38a169";
      ctx.fillRect(
        segment.x * TILE_SIZE,
        segment.y * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE
      );
      ctx.strokeStyle = "#1a202c";
      ctx.strokeRect(
        segment.x * TILE_SIZE,
        segment.y * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE
      );
    });

    if (snake.length > 0) {
      const head = snake[0];
      ctx.fillStyle = "#000";
      const eyeSize = TILE_SIZE / 5;
      const eyeOffset1 = TILE_SIZE / 4;
      const eyeOffset2 = TILE_SIZE - eyeOffset1 - eyeSize;
      const headX = head.x * TILE_SIZE;
      const headY = head.y * TILE_SIZE;

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
      apple.x * TILE_SIZE + TILE_SIZE / 2,
      apple.y * TILE_SIZE + TILE_SIZE / 2,
      TILE_SIZE / 2.2,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }, [snake, apple]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-900 font-mono p-4">
      <h1 className="text-4xl font-bold text-green-400 mb-4 tracking-widest">
        SNAKE HUB
      </h1>
      <br />
      <br />
      <div className="relative bg-gray-800 border-4 border-green-500 shadow-lg shadow-green-500/20 rounded-lg">
        <div className="absolute -top-14 left-0 w-full flex justify-center items-center gap-4">
          <div className="bg-gray-900 border-2 border-green-500 px-4 py-2 rounded-md">
            <span className="text-xl font-bold text-white">Score: {score}</span>
          </div>
          <div className="bg-gray-900 border-2 border-green-500 px-4 py-2 rounded-md">
            <span className="text-xl font-bold text-white">
              High Score: {highScore}
            </span>
          </div>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="bg-gray-900 border-2 border-green-500 px-3 py-2 rounded-md text-xl"
            aria-label="Toggle Sound"
          >
            {isMuted ? "🔇" : "🔊"}
          </button>
          {difficulty && !isGameOver && (
            <button
              onClick={togglePause}
              className="bg-gray-900 border-2 border-green-500 px-3 py-2 rounded-md text-xl"
              aria-label={isPaused ? "Resume Game" : "Pause Game"}
            >
              {isPaused ? "▶️" : "⏸️"}
            </button>
          )}
        </div>

        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="rounded-md"
        />

        {isPaused && !isGameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center rounded-lg">
            <h2 className="text-5xl font-bold text-yellow-400 animate-pulse">
              Paused
            </h2>
            <p className="mt-4 text-white text-lg">
              Press 'Escape' or the Resume button to continue
            </p>
          </div>
        )}

        {(!difficulty || isGameOver) && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center rounded-lg p-4">
            {isGameOver ? (
              <div className="text-center">
                <h2 className="text-5xl font-bold text-red-500">Game Over</h2>
                <p className="text-xl text-white mt-2">
                  Your final score is {score}
                </p>
                <button
                  onClick={resetToMenu}
                  className="mt-8 px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors text-xl"
                >
                  Play Again
                </button>
              </div>
            ) : (
              <div className="text-center">
                <h2 className="text-4xl font-bold text-green-400 mb-6">
                  Select Difficulty
                </h2>
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => startGame("Easy")}
                    className="px-8 py-4 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors text-2xl"
                  >
                    Easy
                  </button>
                  <button
                    onClick={() => startGame("Medium")}
                    className="px-8 py-4 bg-yellow-500 text-white font-bold rounded-lg hover:bg-yellow-600 transition-colors text-2xl"
                  >
                    Medium
                  </button>
                  <button
                    onClick={() => startGame("Hard")}
                    className="px-8 py-4 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors text-2xl"
                  >
                    Hard
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="mt-6 text-gray-400 text-center">
        <p>
          Use <span className="font-bold text-green-400">Arrow Keys</span> to
          move
        </p>
        <p>
          Press <span className="font-bold text-green-400">Escape</span> or
          click the{" "}
          <span className="font-bold text-green-400">Pause Button</span> to
          Pause/Resume
        </p>
      </div>
    </div>
  );
};

export default App;

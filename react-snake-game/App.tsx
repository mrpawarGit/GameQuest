import React, { useState, useEffect, useRef, useCallback } from "react";
import { Point, Direction } from "./types";
import {
  BOARD_SIZE,
  TILE_SIZE,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  INITIAL_SNAKE_POSITION,
  INITIAL_APPLE_POSITION,
  INITIAL_DIRECTION,
  INITIAL_SPEED,
  SPEED_INCREMENT,
  MIN_SPEED,
} from "./constants";

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE_POSITION);
  const [apple, setApple] = useState<Point>(INITIAL_APPLE_POSITION);
  const directionRef = useRef<Direction>(INITIAL_DIRECTION);
  const [speed, setSpeed] = useState<number>(INITIAL_SPEED);
  const [score, setScore] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isGameRunning, setIsGameRunning] = useState<boolean>(false);

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

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE_POSITION);
    setApple(createRandomApple(INITIAL_SNAKE_POSITION));
    directionRef.current = INITIAL_DIRECTION;
    setSpeed(INITIAL_SPEED);
    setScore(0);
    setIsGameOver(false);
    setIsGameRunning(true);
  }, [createRandomApple]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
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
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const gameLoop = useCallback(() => {
    if (isGameOver || !isGameRunning) return;

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

      // Wall collision
      if (
        head.x < 0 ||
        head.x >= BOARD_SIZE ||
        head.y < 0 ||
        head.y >= BOARD_SIZE
      ) {
        setIsGameOver(true);
        setIsGameRunning(false);
        return prevSnake;
      }

      // Self collision
      for (let i = 1; i < newSnake.length; i++) {
        if (head.x === newSnake[i].x && head.y === newSnake[i].y) {
          setIsGameOver(true);
          setIsGameRunning(false);
          return prevSnake;
        }
      }

      newSnake.unshift(head);

      // Apple consumption
      if (head.x === apple.x && head.y === apple.y) {
        setScore((prevScore) => prevScore + 1);
        setSpeed((prevSpeed) =>
          Math.max(MIN_SPEED, prevSpeed - SPEED_INCREMENT)
        );
        setApple(createRandomApple(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [apple, isGameOver, isGameRunning, createRandomApple]);

  useEffect(() => {
    if (isGameRunning && !isGameOver) {
      const intervalId = setInterval(gameLoop, speed);
      return () => clearInterval(intervalId);
    }
  }, [gameLoop, speed, isGameRunning, isGameOver]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#1a202c"; // dark gray-blue
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw snake
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? "#48bb78" : "#38a169"; // shades of green
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

    // Draw apple
    ctx.fillStyle = "#f56565"; // red
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
        REACT SNAKE
      </h1>
      <br />
      <div className="relative bg-gray-800 border-4 border-green-500 shadow-lg shadow-green-500/20 rounded-lg">
        <div className="absolute -top-10 left-0 w-full flex justify-center">
          <div className="bg-gray-900 border-2 border-green-500 px-6 py-1 rounded-md">
            <span className="text-2xl font-bold text-white">
              Score: {score}
            </span>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="rounded-md"
        />

        {!isGameRunning && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center rounded-lg">
            {isGameOver ? (
              <>
                <h2 className="text-5xl font-bold text-red-500">Game Over</h2>
                <p className="text-xl text-white mt-2">
                  Your final score is {score}
                </p>
                <button
                  onClick={resetGame}
                  className="mt-8 px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors text-xl"
                >
                  Restart
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsGameRunning(true)}
                className="mt-8 px-8 py-4 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors text-2xl animate-pulse"
              >
                Start Game
              </button>
            )}
          </div>
        )}
      </div>
      <div className="mt-6 text-gray-400 text-center">
        <p>
          Use <span className="font-bold text-green-400">Arrow Keys</span> to
          move
        </p>
      </div>
    </div>
  );
};

export default App;

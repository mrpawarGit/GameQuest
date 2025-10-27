import { Point, Direction, Difficulty } from "./types";

// Dynamic board size based on viewport
export const getResponsiveBoardSize = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  // Calculate available space (leaving room for UI)
  const availableWidth = Math.min(width - 100, 800);
  const availableHeight = Math.min(height - 300, 800);

  // Use smaller dimension to keep it square
  const maxSize = Math.min(availableWidth, availableHeight);

  // Calculate tile size and board size
  const tileSize = Math.floor(maxSize / 25); // ~25 tiles for larger boards
  const boardSize = Math.floor(maxSize / tileSize);

  return {
    boardSize,
    tileSize,
    canvasWidth: boardSize * tileSize,
    canvasHeight: boardSize * tileSize,
  };
};

// Default values (will be updated dynamically)
export const BOARD_SIZE = 25; // Increased from 20
export const TILE_SIZE = 20; // Will adjust responsively
export const CANVAS_WIDTH = BOARD_SIZE * TILE_SIZE;
export const CANVAS_HEIGHT = BOARD_SIZE * TILE_SIZE;

export const INITIAL_SNAKE_POSITION: Point[] = [
  { x: 12, y: 12 },
  { x: 11, y: 12 },
  { x: 10, y: 12 },
];

export const INITIAL_APPLE_POSITION: Point = { x: 18, y: 18 };
export const INITIAL_DIRECTION = Direction.RIGHT;

export const DIFFICULTY_SETTINGS: Record<
  Difficulty,
  { speed: number; increment: number }
> = {
  Easy: { speed: 200, increment: 5 },
  Medium: { speed: 150, increment: 7 },
  Hard: { speed: 100, increment: 10 },
};

export const MIN_SPEED = 50;
export const HIGH_SCORE_STORAGE_KEY = "snakeHighScore";

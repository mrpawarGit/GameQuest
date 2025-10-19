import { Point, Direction, Difficulty } from './types';

export const BOARD_SIZE = 20;
export const TILE_SIZE = 25;
export const CANVAS_WIDTH = BOARD_SIZE * TILE_SIZE;
export const CANVAS_HEIGHT = BOARD_SIZE * TILE_SIZE;

export const INITIAL_SNAKE_POSITION: Point[] = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

export const INITIAL_APPLE_POSITION: Point = { x: 15, y: 15 };
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

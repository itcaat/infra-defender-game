/**
 * GridSystem - Manages grid-based positioning and placement validation
 */

import type { GridPosition } from '../types/phaser.types';
import { GAME_CONFIG } from '../config/game.config';

export class GridSystem {
  private occupiedCells: Set<string> = new Set();
  private pathCells: Set<string> = new Set();
  private buildableArea: Set<string> = new Set();

  constructor() {
    // Initialize buildable area (everywhere except path for now)
    this.initializeBuildableArea();
  }

  /**
   * Initialize buildable area
   */
  private initializeBuildableArea(): void {
    // For now, make most of the grid buildable
    // We'll restrict this based on level design later
    for (let x = 0; x < GAME_CONFIG.GRID_COLS; x++) {
      for (let y = 0; y < GAME_CONFIG.GRID_ROWS; y++) {
        // Skip top row (UI space) and path cells
        if (y > 0 && !this.isPathCell(x, y)) {
          this.buildableArea.add(this.cellKey(x, y));
        }
      }
    }
  }

  /**
   * Set path cells (where enemies walk)
   */
  setPath(path: GridPosition[] | GridPosition[][]): void {
    this.pathCells.clear();
    
    // Handle both single path and multiple paths
    const paths = Array.isArray(path[0]) ? path as GridPosition[][] : [path as GridPosition[]];
    
    paths.forEach(singlePath => {
      singlePath.forEach(pos => {
        this.pathCells.add(this.cellKey(pos.x, pos.y));
      });
    });
    
    // Rebuild buildable area to exclude path
    this.initializeBuildableArea();
  }

  /**
   * Check if a cell is valid for tower placement
   */
  isValidPlacement(gridX: number, gridY: number): boolean {
    // Check bounds
    if (gridX < 0 || gridX >= GAME_CONFIG.GRID_COLS ||
        gridY < 0 || gridY >= GAME_CONFIG.GRID_ROWS) {
      return false;
    }

    const key = this.cellKey(gridX, gridY);

    // Check if cell is buildable
    if (!this.buildableArea.has(key)) {
      return false;
    }

    // Check if already occupied
    if (this.occupiedCells.has(key)) {
      return false;
    }

    // Check if it's on the path
    if (this.pathCells.has(key)) {
      return false;
    }

    return true;
  }

  /**
   * Occupy a cell (place tower)
   */
  occupyCell(gridX: number, gridY: number): void {
    this.occupiedCells.add(this.cellKey(gridX, gridY));
  }

  /**
   * Free a cell (remove tower)
   */
  freeCell(gridX: number, gridY: number): void {
    this.occupiedCells.delete(this.cellKey(gridX, gridY));
  }

  /**
   * Check if cell is occupied
   */
  isOccupied(gridX: number, gridY: number): boolean {
    return this.occupiedCells.has(this.cellKey(gridX, gridY));
  }

  /**
   * Check if cell is on path
   */
  isPathCell(gridX: number, gridY: number): boolean {
    return this.pathCells.has(this.cellKey(gridX, gridY));
  }

  /**
   * Convert grid position to world position (center of cell)
   */
  gridToWorld(gridX: number, gridY: number): { x: number; y: number } {
    return {
      x: gridX * GAME_CONFIG.GRID_SIZE + GAME_CONFIG.GRID_SIZE / 2,
      y: gridY * GAME_CONFIG.GRID_SIZE + GAME_CONFIG.GRID_SIZE / 2,
    };
  }

  /**
   * Convert world position to grid position
   */
  worldToGrid(worldX: number, worldY: number): GridPosition {
    return {
      x: Math.floor(worldX / GAME_CONFIG.GRID_SIZE),
      y: Math.floor(worldY / GAME_CONFIG.GRID_SIZE),
    };
  }

  /**
   * Get cell key for Set storage
   */
  private cellKey(x: number, y: number): string {
    return `${x},${y}`;
  }

  /**
   * Clear all occupied cells
   */
  clear(): void {
    this.occupiedCells.clear();
  }
}


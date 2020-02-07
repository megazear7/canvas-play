import { drawLine, drawRect } from '../utility.js';

export default class Grid {
  constructor({
              context,
              cellSize = 10,
              rows = 100,
              columns = 100,
              filledCells = [ ]
            } = {}) {
    this.context = context;
    this.cellSize = cellSize;
    this.columns = columns;
    this.rows = rows;
    this.filledCells = filledCells;
  }

  draw() {
    for (let i = 0; i < this.columns + 1; i++) {
      drawLine(
        this.context,
        { x: this.cellSize * i, y: 0 },
        { x: this.cellSize * i, y: this.columns * this.cellSize },
        1,
        "rgba(0, 0, 0, 1)"
      );
    }

    for (let i = 0; i < this.rows + 1; i++) {
      drawLine(
        this.context,
        { x: 0, y: this.cellSize * i },
        { x: this.rows * this.cellSize, y: this.cellSize * i },
        1,
        "rgba(0, 0, 0, 1)"
      );
    }

    this.filledCells.forEach(cell => {
      drawRect({
        context: this.context,
        x: cell.x * this.cellSize,
        y: cell.y * this.cellSize,
        w: this.cellSize,
        h: this.cellSize
      });
    });
  }

  update() {
    this.draw();
  }
}

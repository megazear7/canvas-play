import { drawCircle, drawLine } from '../utility.js';

export default class StaticImage {
  constructor({
              context,
              x,
              y,
              size,
              color = "rgba(100,123,212,1)",
              lineThickness = 10,
            } = {}) {
    this.context = context;
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.lineThickness = lineThickness;

    // Set starting point
    this.cells = [ 1, 2, 1, 2, 1, 2, 2, 1, 2 ];
    this.lines = this.makeLines();
  }

  draw() {
    this.lines.forEach(line => drawLine(this.context, line.p1, line.p2, this.lineThickness, this.color));

    this.cells.forEach((cell, index) => {
      if (cell === 1) {
        this.drawX(index + 1);
      } else if (cell === 2) {
        this.drawY(index + 1);
      }
    });
  }

  update() {
    this.draw();
  }

  drawX(pos) {
    const topLeft = this.getPointForPos(pos);

    const xLines = [{
      p1: { x: topLeft.x + (this.lineThickness*2), y: topLeft.y + (this.lineThickness*2) },
      p2: { x: topLeft.x + (this.size * (1/3)) - (this.lineThickness*2), y: topLeft.y + (this.size * (1/3)) - (this.lineThickness*2)},
    }, {
      p1: { x: topLeft.x + (this.size * (1/3)) - (this.lineThickness*2), y: topLeft.y + (this.lineThickness*2) },
      p2: { x: topLeft.x + (this.lineThickness*2), y: topLeft.y + (this.size * (1/3)) - (this.lineThickness*2) },
    }];

    xLines.forEach(line => drawLine(this.context, line.p1, line.p2, this.lineThickness, this.color));
  }

  drawY(pos) {
    const topLeft = this.getPointForPos(pos);

    drawCircle({
      context: this.context,
      x: topLeft.x + ((this.size * (1/3))/2),
      y: topLeft.y + ((this.size * (1/3))/2),
      radius: ((this.size * (1/3))/2) - (this.lineThickness*2),
      lineWidth: this.lineThickness,
      lineStyle: this.color,
      opacity: 0,
    });
  }

  getPointForPos(pos) {
    const gridX = (pos % 3);
    const gridY = Math.ceil(pos/3) - 1;

    return { x: this.x + (this.size * (gridX/3)), y: this.y + (this.size * (gridY/3)) };
  }

  makeLines() {
    return [{
        p1: { x: this.x + (this.size * (1/3)), y: this.y },
        p2: { x: this.x + (this.size * (1/3)), y: this.y + this.size },
      }, {
        p1: { x: this.x + (this.size * (2/3)), y: this.y },
        p2: { x: this.x + (this.size * (2/3)), y: this.y + this.size },
      }, {
        p1: { x: this.x,             y: this.y + (this.size * (1/3)) },
        p2: { x: this.x + this.size, y: this.y + (this.size * (1/3)) },
      }, {
        p1: { x: this.x,             y: this.y + (this.size * (2/3)) },
        p2: { x: this.x + this.size, y: this.y + (this.size * (2/3)) },
    }];
  }
}

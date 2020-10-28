import { movePoint, drawLine, approachValue, distanceBetween } from '../utility.js';

export default class StaticImage {
  constructor({
              context,
              x,
              y,
              size,
              lineColor = "rgba(100,123,212,1)",
              lineThickness = 10,
            } = {}) {
    this.context = context;
    this.x = x;
    this.y = y;
    this.size = size;
    this.lineColor = lineColor;
    this.lineThickness = lineThickness;

    // Set starting point
    this.boardState = [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
    this.lines = this.makeLines();
  }

  draw() {
    this.lines.forEach(line => drawLine(this.context, line.p1, line.p2, this.lineThickness, this.lineColor));
  }

  update() {
    this.draw();
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

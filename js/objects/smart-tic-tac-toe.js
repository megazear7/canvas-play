import { movePoint, drawLine, approachValue, distanceBetween } from '../utility.js';

export default class StaticImage {
  constructor({
              context,
              x,
              y,
              size,
            } = {}) {
    this.context = context;
    this.x = x;
    this.y = y;
    this.size = size;

    // Set starting point
    this.boardState = [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
  }

  draw() {
    console.log('test', this.x, this.y, this.size);

    let lines = [];

    lines.push({
      p1: { x: this.x + (this.size * (1/3)), y: this.y },
      p2: { x: this.x + (this.size * (1/3)), y: this.y + this.size },
    });

    lines.push({
      p1: { x: this.x + (this.size * (2/3)), y: this.y },
      p2: { x: this.x + (this.size * (2/3)), y: this.y + this.size },
    });

    lines.push({
      p1: { x: this.x,             y: this.y + (this.size * (1/3)) },
      p2: { x: this.x + this.size, y: this.y + (this.size * (1/3)) },
    });

    lines.push({
      p1: { x: this.x,             y: this.y + (this.size * (2/3)) },
      p2: { x: this.x + this.size, y: this.y + (this.size * (2/3)) },
    });

    lines.forEach(line => {
      drawLine(this.context, line.p1, line.p2, 9, "rgba(100,123,212,1)");
    });
  }

  update() {
    this.draw();
  }
}

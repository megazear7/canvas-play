import { movePoint, drawLine } from '../utility.js';

export default class MovingLine {
  constructor(config) {
    // Context information for transferring from perctages to absolute values
    this._context = config.context;
    this._contextWidth = config.contextWidth;
    this._contextHeight = config.contextHeight;

    // Line configurations
    this.thickness = config.thickness;
    this.color = config.color;
    this.speed = config.speed;

    // Current position
    this.p1 = config.p1;
    this.p2 = config.p2;

    // Resting position
    this.rest = { };
    this.rest.p1 = config.p1;
    this.rest.p2 = config.p2;

    // On hover target position
    if (config.target) {
      this.target = { };
      this.target.p1 = config.target.p1;
      this.target.p2 = config.target.p2;
    }
  }

  get pos() {
    return {
      p1: {
        x: this._contextWidth * this.p1.x,
        y: this._contextHeight * this.p1.y
      },
      p2: {
        x: this._contextWidth * this.p2.x,
        y: this._contextHeight * this.p2.y
      }
    }
  }

  update(active) {
    if (active && this.target) {
      this.p1 = movePoint(this.p1, this.target.p1, this.speed);
      this.p2 = movePoint(this.p2, this.target.p2, this.speed);
    } else {
      this.p1 = movePoint(this.p1, this.rest.p1, this.speed);
      this.p2 = movePoint(this.p2, this.rest.p2, this.speed);
    }
  }

  draw() {
    drawLine(
      this._context,
      this.pos.p1,
      this.pos.p2,
      this.thickness,
      this.color
    );
  }
}

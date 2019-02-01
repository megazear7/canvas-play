import { movePoint, drawLine, approachValue } from '../utility.js';

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
    this.rest.thickness = config.thickness;

    // On hover target position
    if (config.target) {
      this.target = config.target;
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
    this.active = active;
    if (this.active && this.target) {
      this.thickness = approachValue(this.thickness, this.target.thickness, this.speed);
      this.p1 = movePoint(this.p1, this.target.p1, this.speed);
      this.p2 = movePoint(this.p2, this.target.p2, this.speed);
    } else {
      this.thickness = approachValue(this.thickness, this.rest.thickness, this.speed);
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

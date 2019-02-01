import { movePoint, drawLine, approachValue, distanceBetween } from '../utility.js';

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

    // Initial position and target
    this.p1 = config.p1;
    this.p2 = config.p2;
    this.currentTarget = {
      p1: this.p1,
      p2: this.p2,
      thickness: this.thickness
    };

    // Resting position
    this.rest = { };
    this.rest.p1 = config.p1;
    this.rest.p2 = config.p2;
    this.rest.thickness = config.thickness;

    // Targets to move towards on hover
    this.hoverTargets = config.hoverTargets ? config.hoverTargets : [];
    this.currentHoverTargetIndex = 0;
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
    if (this.active) {
      if (this.hoverTargets.length > 0) {
        if (distanceBetween(this.p1, this.currentTarget.p1) < 0.01 &&
            distanceBetween(this.p2, this.currentTarget.p2) < 0.01) {
          this.currentHoverTargetIndex++;
        }

        if (this.currentHoverTargetIndex >= this.hoverTargets.length) {
          this.currentHoverTargetIndex = 0;
        }

        this.currentTarget = this.hoverTargets[this.currentHoverTargetIndex];
      }

      this.thickness = approachValue(this.thickness, this.currentTarget.thickness, this.speed);
      this.p1 = movePoint(this.p1, this.currentTarget.p1, this.speed);
      this.p2 = movePoint(this.p2, this.currentTarget.p2, this.speed);
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

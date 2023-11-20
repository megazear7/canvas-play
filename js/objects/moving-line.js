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
    this.atRest = true;
    this.currentTarget = {
      p1: this.p1,
      p2: this.p2,
      thickness: this.thickness,
      color: this.color
    };
    this.previousTarget = this.currentTarget;

    // Resting position
    this.rest = { };
    this.rest.p1 = config.p1;
    this.rest.p2 = config.p2;
    this.rest.speed = config.speed;
    this.rest.thickness = config.thickness;
    this.rest.color = this.color;

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

  hasReachedTarget(sensitivity) {
    return distanceBetween(this.p1, this.currentTarget.p1) < sensitivity &&
           distanceBetween(this.p2, this.currentTarget.p2) < sensitivity;
  }

  returnToRest() {
    this.atRest = true;
    this.previousTarget = this.currentTarget;
    this.currentHoverTargetIndex = 0;
    this.currentTarget = this.rest;
  }

  updateHoverTarget() {
    this.atRest = false;
    this.previousTarget = this.currentTarget;
    this.currentHoverTargetIndex++;

    if (this.currentHoverTargetIndex >= this.hoverTargets.length) {
      this.currentHoverTargetIndex = 0;
    }

    if (this.hoverTargets.length > 0) {
      this.currentTarget = this.hoverTargets[this.currentHoverTargetIndex];
    }
  }

  update() {
    this.thickness = approachValue(this.thickness, this.currentTarget.thickness, this.speed);
    this.p1 = movePoint(this.previousTarget.p1, this.p1, this.currentTarget.p1, this.currentTarget.speed);
    this.p2 = movePoint(this.previousTarget.p2, this.p2, this.currentTarget.p2, this.currentTarget.speed);
  }

  draw() {
    drawLine(
      this._context,
      this.pos.p1,
      this.pos.p2,
      this.thickness,
      this.currentTarget.color
    );
  }
}

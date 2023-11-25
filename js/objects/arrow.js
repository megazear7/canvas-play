import { drawCircle, getDistancePts } from '../utility.js';

export const ARROW = 'arrow';

export default class Arrow {
  constructor({
              context,
              environment,
              x,
              y,
              destination,
              strength
            } = {}) {
    this.context = context;
    this.environment = environment;
    this.id = Math.random();
    this.x = x;
    this.y = y;
    this.destination = destination;
    this.strength = strength;
    const dx1 = destination.x - x;
    const dy1 = destination.y - y;
    this.angle = Math.atan2(dy1, dx1);
    this.type = ARROW;
    this.dx = Math.cos(this.angle) * (strength / 5);
    this.dy = Math.sin(this.angle) * (strength / 5);
  }

  draw() {
    drawCircle({
      context: this.context,
      x: this.x,
      y: this.y,
      radius: 3,
      lineWidth: 1,
      lineStyle: `rgba(0, 0, 0, 1)`,
      red: 0,
      green: 0,
      blue: 0,
    });
  }

  move() {
    this.x = this.x + this.dx;
    this.y = this.y + this.dy;   
  }

  update() {
    if (getDistancePts(this, this.destination) < this.destination.radius) {
      if (this.destination.home.outposts.length === 1) {
        this.destination.home.failedKingdom = true;
        setTimeout(() => {
          this.destination.home.failedKingdom = false;
        }, this.strength * 1000)
      }
      this.destination.destroy = true;
      this.destroy = true;
    }
    this.draw();
    this.move();
  }

  minorUpdate() {
  }

  majorUpdate() {
  }
}

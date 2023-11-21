import { randomX, randomY, drawCircle, movePoint } from '../utility.js';
export const APPLE = 'apple';

export default class Apple {
  constructor({
              context,
              environment,
              x = randomX(),
              y = randomY(),
              red = 255,
              green = 0,
              blue = 0,
              radius = 6,
              food = 10 + (Math.random() * 10)
            } = {}) {
    this.context = context;
    this.environment = environment;
    this.id = Math.random();
    this.x = x;
    this.y = y;
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.radius = radius;
    this.food = food;
    this.type = APPLE;
  }

  right() {
    return this.x + this.radius;
  }

  left() {
    return this.x - this.radius;
  }

  bottom() {
    return this.y + this.radius;
  }

  top() {
    return this.y - this.radius;
  }

  draw() {
    drawCircle({
      context: this.context,
      x: this.x,
      y: this.y,
      radius: this.radius,
      lineWidth: 1,
      red: this.red,
      green: this.green,
      blue: this.blue
    });
  }

  update() {
    this.draw();
    if (this.location && this.location.destination) {
      const p = movePoint(this, this, this.location.destination, this.location.speed);
      this.x = p.x;
      this.y = p.y;
    }
  }

  majorUpdate() {
    
  }
}

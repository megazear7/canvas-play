import { randomX, randomY, movePoint2, randomColor, drawCircle } from '../utility.js';

export default class VectorBall {
  constructor({
              context,
              x = randomX(),
              y = randomY(),
              red = randomColor(),
              green = randomColor(),
              blue = randomColor(),
              radius = 10,
              agility = 0.1,
              maxSpeed = 3,
            } = {}) {
    this.context = context;
    this.x = x;
    this.y = y;
    this.v = { x: 0, y: 0 };
    this.d = { x: randomX(), y: randomY() };
    this.agility = agility
    this.maxSpeed = maxSpeed
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.radius = radius;
    this.impacting = false;
  }

  draw() {
    drawCircle({context: this.context, x: this.x, y: this.y, radius: this.radius, lineWidth: 0, red: this.red, green: this.green, blue: this.blue});
  }

  move() {
    this.v = movePoint2(this, this.d, this.v, this.agility, this.maxSpeed);
    this.x = this.x + this.v.x;
    this.y = this.y + this.v.y;
  }

  get currentSpeed() {
    return Math.sqrt(this.v.x * this.v.x + this.v.y * this.v.y);
  }

  update() {
    this.draw();
    this.move();
  }
}

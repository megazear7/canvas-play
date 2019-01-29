import { randomX, randomY, randomSpeed, randomColor, drawCircle } from '../utility.js';

export default class Ball {
  constructor({
              context,
              x = randomX(),
              y = randomY(),
              dx = randomSpeed(10),
              dy = randomSpeed(10),
              red = randomColor(),
              green = randomColor(),
              blue = randomColor(),
              radius = (Math.random() * 40) + 10,
              speed = 1
            } = {}) {
    this.context = context;
    this.x = x;
    this.y = y;
    this.dx = dx * speed;
    this.dy = dy * speed;
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.radius = radius;
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
    drawCircle({context: this.context, x: this.x, y: this.y, radius: this.radius, width: 5, lineWidth: 0, red: this.red, green: this.green, blue: this.blue});
  }

  impactedWall() {
    // Stub method for super classes
  }

  move() {
    if (this.right() > window.innerWidth) {
      this.dx = -Math.abs(this.dx);
      this.impactedWall();
    }

    if (this.left() < 0) {
      this.dx = Math.abs(this.dx);
      this.impactedWall();
    }

    if (this.bottom() > window.innerHeight) {
      this.dy = -Math.abs(this.dy);
      this.impactedWall();
    }

    if (this.top() < 0) {
      this.dy = Math.abs(this.dy);
      this.impactedWall();
    }

    if (Math.abs(this.dx) > 0.5) {
      this.x += this.dx;
    }

    if (Math.abs(this.dy) > 0.5) {
      this.y += this.dy;
    }
  }

  update() {
    this.draw();
    this.move();
  }
}

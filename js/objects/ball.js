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
    this.impacting = false;
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

  impactedFloor() {
    // Stub method for super classes
  }

  impactedCeiling() {
    // Stub method for super classes
  }

  move() {
    if (! this.impacting && this.right() > window.innerWidth) {
      this.dx = -Math.abs(this.dx);
      this.impacting = true;
      setTimeout(() => { this.impacting = false; }, 200);
      this.impactedWall();
    }

    if (! this.impacting && this.left() < 0) {
      this.dx = Math.abs(this.dx);
      this.impacting = true;
      setTimeout(() => { this.impacting = false; }, 200);
      this.impactedWall();
    }

    if (! this.impacting && this.bottom() > window.innerHeight) {
      this.dy = -Math.abs(this.dy);
      this.impacting = true;
      setTimeout(() => { this.impacting = false; }, 200);
      this.impactedFloor();
    }

    if (! this.impacting && this.top() < 0) {
      this.dy = Math.abs(this.dy);
      this.impacting = true;
      setTimeout(() => { this.impacting = false; }, 200);
      this.impactedCeiling();
    }

    this.x += this.dx;
    this.y += this.dy;
  }

  update() {
    this.draw();
    this.move();
  }
}

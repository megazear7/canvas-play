import { randomX, randomY, randomSpeed, randomColor, drawCircle } from '../utility.js';

export default class StellarObject {
  constructor({
              context,
              stellarObjects = [ ],
              x = (randomX() * 0.5) + (window.innerWidth / 4),
              y = (randomY() * 0.5) + (window.innerHeight / 4),
              dx = (randomSpeed() * 0.5),
              dy = (randomSpeed() * 0.5),
              mass = (Math.random() * 0.5) + 0.5,
              red = randomColor(),
              green = randomColor(),
              blue = randomColor(),
              pause = false
            } = {}) {
    this.context = context;
    this.stellarObjects = stellarObjects;
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.mass = mass;
    this.radius = Math.log2(mass * mass * mass);
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.pause = pause;
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

  move() {
    this.stellarObjects.forEach(object => {
      if (this !== object) {
        const GRAVITY = 100;

        let angle = Math.atan2(object.y - this.y, object.x - this.x);
        let distance = Math.sqrt(Math.pow(this.x + object.x, 2), Math.pow(this.y + object.y, 2));
        let force = (GRAVITY * this.mass * object.mass) / (distance * distance)
        let xForce = Math.cos(angle) * force;
        let yForce = Math.sin(angle) * force;
        let xAcc = xForce / this.mass;
        let yAcc = yForce / this.mass;

        this.dx += xAcc;
        this.dy += yAcc;
      }
    });

    this.x += this.dx;
    this.y += this.dy;
  }

  update() {
    this.draw();
    if (! this.pause) {
      this.move();
    }
  }
}

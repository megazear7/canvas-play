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
              paused = false
            } = {}) {
    this.context = context;
    this.stellarObjects = stellarObjects;
    const screenAdjustment = 1000 / Math.min(window.innerWidth, window.innerWidth)

    this.x = x;
    this.y = y;
    this.dx = dx * screenAdjustment;
    this.dy = dy * screenAdjustment;
    this.mass = mass * screenAdjustment;
    this.radius = Math.log2(Math.pow(mass + 1, 3)) * screenAdjustment;
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.paused = paused;
    this.mouseCaptured = false;

    document.body.addEventListener('mousedown', event => {
      let distance = Math.sqrt(Math.pow(this.x - event.clientX, 2) + Math.pow(this.y - event.clientY, 2));
      if (distance < this.radius) {
        console.log('captured');
        this.paused = true;
        this.mouseCaptured = true;
      }
    });

    document.body.addEventListener('mouseup', event => {
      if (this.mouseCaptured) {
        this.paused = false;
        this.mouseCaptured = false;
      }
    });

    document.body.addEventListener('mousemove', event => {
      this.mouseX = event.clientX;
      this.mouseY = event.clientY;
    });
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

  moveToCursor() {
    this.x = this.mouseX;
    this.y = this.mouseY;
  }

  update() {
    this.draw();
    if (this.mouseCaptured) {
      this.moveToCursor();
    } else if (! this.paused) {
      this.move();
    }
  }
}

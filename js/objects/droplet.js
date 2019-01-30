import { randomX, randomY, randomSpeed, randomColor, drawCircle } from '../utility.js';

export default class Droplet {
  constructor({
              context,
              x = Math.random() * window.innerWidth,
              y = 0,
              size = 10
            } = {}) {
    this.context = context;
    this.x = x;
    this.y = y;
    this.dx = 0;
    this.dy = 0;
    this.size = size;
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

    this.context.beginPath();
    this.context.moveTo(this.x, this.y);

    this.context.bezierCurveTo(
      this.x + (this.size / 2),
      this.y - (this.size / 4),
      this.x + (this.size / 4),
      this.y - (this.size / 2),
      this.x,
      this.y - this.size);

    this.context.bezierCurveTo(
      this.x - (this.size / 4),
      this.y - (this.size / 2),
      this.x - (this.size / 2),
      this.y - (this.size / 4),
      this.x,
      this.y);


    this.context.lineWidth = 0;
    this.context.strokeStyle = 'rgba(0, 0, 0, 0)';
    this.context.stroke();

    var grd = this.context.createRadialGradient(this.x, this.y, this.size/4, this.x, this.y, this.size);
    grd.addColorStop(0, "rgba(0, 0, 0, 0.5)");
    grd.addColorStop(1, "rgba(0, 0, 0, 0)");

    this.context.fillStyle = grd;
    this.context.fill();
  }

  impactedWall() {
    // Nothing to do
  }

  impactedWall() {
    // Nothing to do
  }

  impactedGround() {
    // TODO
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
      this.impactedGround();
    }

    if (this.top() < 0) {
      this.dy = Math.abs(this.dy);
      this.impactedCeiling();
    }

    this.x += this.dx;
    this.y += this.dy;

    this.dy += 0.1;
  }

  update() {
    this.draw();
    this.move();
  }
}

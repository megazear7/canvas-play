import { randomX, randomY, randomSpeed, randomColor, drawCircle } from '../utility.js';

export default class Droplet {
  constructor({
              context,
              x = (Math.random() * window.innerWidth * 2) - (window.innerWidth / 2),
              y = 0,
              dx = 0,
              dy = 1,
              size = 10
            } = {}) {
    this.context = context;
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.size = size;
  }

  right() {
    return this.x + (this.size / 2);
  }

  left() {
    return this.x - (this.size / 2);
  }

  bottom() {
    return this.y;
  }

  top() {
    return this.y - this.size;
  }

  draw() {
    this.context.beginPath();
    this.context.moveTo(this.x, this.y);

    this.context.bezierCurveTo(
      this.x + (this.size / 3),
      this.y,
      this.x + (this.size / 3),
      this.y - (this.size / 2),
      this.x,
      this.y - this.size * 1.75);

    this.context.bezierCurveTo(
      this.x - (this.size / 3),
      this.y - (this.size / 2),
      this.x - (this.size / 3),
      this.y,
      this.x,
      this.y);

    this.context.lineWidth = 0;
    this.context.strokeStyle = 'rgba(0, 0, 0, 0)';
    this.context.stroke();

    var grd = this.context.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 1.75);
    grd.addColorStop(0, "rgba(0, 0, 0, 0.6)");
    grd.addColorStop(1, "rgba(0, 0, 0, 0.1)");
    this.context.fillStyle = grd;
    this.context.fill();

    this.context.beginPath();
    this.context.arc(this.x + (this.size/10), this.y - (this.size/6), this.size / 16, 0, Math.PI * 2, false);
    this.context.stroke();
    this.context.fillStyle = `rgba(255, 255, 255, 1)`;
    this.context.fill();
  }

  impactedGround() {
    // TODO
  }

  move() {
    if (this.bottom() > window.innerHeight) {
      this.impactedGround();
    }

    this.x += this.dx;
    this.y += this.dy;

    this.dy += 0.15;
  }

  update() {
    this.draw();
    this.move();
  }
}

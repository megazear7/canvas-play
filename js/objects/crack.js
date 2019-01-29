import { positiveOrNegative, randomNumber, randomX, randomY } from '/js/utility.js';

export default class Crack {
  constructor({context: context, segmentCount = 2, breakSize = 100, breakSizeAcceleration = 0, red = 0, green = 0, blue = 0, opacity = 0.1, breakSpeed = 0, breakAcceleration = 0} = {}) {
    this.context = context;
    this.breakSize = breakSize;
    this.breakSizeAcceleration = breakSizeAcceleration;
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.opacity = opacity;
    this.breakSpeed = breakSpeed;
    this.breakAcceleration = breakAcceleration;
    this.nextEndBreak = Math.random();
    this.nextStartBreak = Math.random();
    this.points = [{ x: randomX(), y: randomY() }];

    for (var i = 0; i < segmentCount; i++) {
      this.addEndPoint()
    }
  }

  addEndPoint() {
    this.addPoint(this.points[this.points.length-1]);
  }

  addStartPoint() {
    this.addPoint(this.points[0]);
  }

  addPoint(from) {
    var newX = randomNumber({min: 1, max: this.breakSize}) * positiveOrNegative();
    var newY = randomNumber({min: 1, max: this.breakSize}) * positiveOrNegative();
    var startPoint = this.points[0];
    var startX = from.x;
    var startY = from.y;
    var x = this.startX + newX > window.innerWidth ? startX - newX : startX + newX;
    var y = this.startY + newY > window.innerWidth ? startX - newY : startY + newY;
    this.points.push({ x: x, y: y });
  }

  draw() {
    this.context.beginPath();
    this.points.forEach(point => this.context.lineTo(point.x, point.y));
    this.context.strokeStyle = `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.opacity})`;
    this.context.stroke();
  }

  update() {
    this.breakSpeed += this.breakAcceleration;
    this.breakSize += this.breakSizeAcceleration;

    this.nextEndBreak += Math.random() * this.breakSpeed;
    if (this.nextEndBreak > 1) {
      this.nextEndBreak = 0;
      this.addEndPoint();
    }

    this.nextStartBreak += Math.random() * this.breakSpeed;
    if (this.nextStartBreak > 1) {
      this.nextStartBreak = 0;
      this.addStartPoint();
    }

    this.draw();
  }
}

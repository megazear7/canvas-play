import { randomNumber, randomX, randomY } from '/js/utility.js';

export default class Crack {
  constructor({
                context,
                startX = randomX(),
                startY = randomY(),
                segmentCount = 2,
                breakSize = 100,
                breakSizeAcceleration = 0,
                red = 0,
                green = 0,
                blue = 0,
                opacity = 0.1,
                breakSpeed = 0,
                breakAcceleration = 0,
                startGrows = true,
                endGrows = true,
                startGrowVerticalDir = 0,
                startGrowHorizontalDir = 0,
                endGrowVerticalDir = 0,
                endGrowHorizontalDir = 0,
                stayBounded = false} = {}) {
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
    this.startGrows = startGrows;
    this.endGrows = endGrows;
    this.startGrowVerticalDir = startGrowVerticalDir;
    this.startGrowHorizontalDir = startGrowHorizontalDir;
    this.endGrowVerticalDir = endGrowVerticalDir;
    this.endGrowHorizontalDir = endGrowHorizontalDir;
    this.stayBounded = stayBounded;
    this.points = [{ x: startX, y: startY }];

    for (var i = 0; i < segmentCount; i++) {
      this.addEndPoint()
    }
  }

  addEndPoint() {
    this.addPoint(this.points[this.points.length-1], this.endGrowHorizontalDir, this.endGrowVerticalDir);
  }

  addStartPoint() {
    this.addPoint(this.points[0], this.startGrowHorizontalDir, this.startGrowVerticalDir);
  }

  addPoint(from, horizontalDir, verticalDir) {
    var newX = randomNumber({
      min: -(this.breakSize * (1 - horizontalDir)),
      max: (this.breakSize * (1 + horizontalDir))
    });

    var newY = randomNumber({
      min: -(this.breakSize * (1 - verticalDir)),
      max: (this.breakSize * (1 + verticalDir))
    });

    var startPoint = this.points[0];
    var startX = from.x;
    var startY = from.y;

    var x = startX + newX;
    var y = startY + newY;
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

    if (this.endGrows) {
      this.nextEndBreak += Math.random() * this.breakSpeed;
      if (this.nextEndBreak > 1) {
        this.nextEndBreak = 0;
        this.addEndPoint();
      }
    }

    if (this.startGrows) {
      this.nextStartBreak += Math.random() * this.breakSpeed;
      if (this.nextStartBreak > 1) {
        this.nextStartBreak = 0;
        this.addStartPoint();
      }
    }

    this.draw();
  }
}

import { randomNumber, randomX, randomY } from '../utility.js';
import Pebble from './pebble.js';

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
    this.doUpdate = true;
    this.render = true;
    this.reachedEdge = false;
    this.points = [{ x: startX, y: startY }];
    this.pebbles = [];

    for (var i = 0; i < segmentCount; i++) {
      this.addEndPoint()
    }

  }

  get startPoint() {
    return this.points[0];
  }

  get endPoint() {
    return this.points[this.points.length-1];
  }

  addEndPoint() {
    this.addPoint(this.points[this.points.length-1], this.endGrowHorizontalDir, this.endGrowVerticalDir);
    this.throwRubble(this.points[this.points.length-1]);
  }

  addStartPoint() {
    this.addPoint(this.points[0], this.startGrowHorizontalDir, this.startGrowVerticalDir);
    this.throwRubble(this.points[0]);
  }

  throwRubble(point) {
    var pebbleCount = 1;

    for (var i = 0; i < pebbleCount; i++) {
      this.pebbles.push(new Pebble({
        context: this.context,
        x: point.x,
        y: point.y,
        red: 0,
        green: 0,
        blue: 0,
        opacity: 1,
        speed: 0.5,
        weight: 0.7,
        radius: Math.random() + 1
      }));
    }
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

    if (this.stayBounded) {
      if (x > window.innerWidth) {
        x = window.innerWidth;
        this.reachedEdge = true;
      }
      if (x < 0) {
        x = 0;
        this.reachedEdge = true;
      }
      if (y > window.innerHeight) {
        y = window.innerHeight;
        this.reachedEdge = true;
      }
      if (y < 0) {
        y = 0;
        this.reachedEdge = true;
      }
    }

    this.points.push({ x: x, y: y });
  }

  draw() {
    this.context.beginPath();
    this.points.forEach(point => this.context.lineTo(point.x, point.y));
    this.context.strokeStyle = `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.opacity})`;
    this.context.stroke();
  }

  update() {
    if (this.doUpdate) {
      this.breakSize += this.breakSizeAcceleration;
      this.breakSpeed += this.breakAcceleration;

      if (this.endGrows) {
        this.nextEndBreak += Math.random() * this.breakSpeed;
        while (this.nextEndBreak > 1) {
          this.nextEndBreak--;
          this.addEndPoint();
        }
      }

      if (this.startGrows) {
        this.nextStartBreak += Math.random() * this.breakSpeed;
        while (this.nextStartBreak > 1) {
          this.nextStartBreak--;
          this.addStartPoint();
        }
      }
    }

    if (this.render) {
      this.draw();
    }
    this.pebbles.forEach(pebble => pebble.update());
  }
}

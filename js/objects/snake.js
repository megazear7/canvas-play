import { randomColor, positiveOrNegative } from '../utility.js';

export default class Snake {
  constructor({
              canvas,
              radius = (Math.random() * 20) + 40,
              x = (Math.random() * (canvas.width -  (radius * 2))) + radius,
              y = (Math.random() * (canvas.height - (radius * 2))) + radius,
              dx = positiveOrNegative() * ((Math.random() * 7) + 8),
              dy = positiveOrNegative() * ((Math.random() * 7) + 8),
              red = randomColor(),
              green = randomColor(),
              blue = randomColor(),
              speed = 0.3,
              mouthSpeed = 1
            } = {}) {
    this.canvas = canvas;
    this.context = this.canvas.getContext('2d');;
    this.x = x;
    this.y = y;
    this.dx = dx * speed;
    this.dy = dy * speed;
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.radius = radius;
    this.mouthSpeed = mouthSpeed;
    this.mouthOpen = 1;
    this.mouthOpening = false;
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
    var facingAngle = Math.atan(this.dx / (-this.dy));
    if (this.dy >= 0) {
      facingAngle += Math.PI / 2;
    } else {
      facingAngle -= Math.PI / 2;
    }
    var startAngle = facingAngle + (Math.PI * 0.25 * Math.max(this.mouthOpen, 0.01));
    var endAngle = facingAngle - (Math.PI * 0.25 * Math.max(this.mouthOpen, 0.01));

    this.context.beginPath();
    this.context.arc(this.x, this.y, this.radius, startAngle, endAngle, false);
    this.context.lineTo(this.x, this.y);
    this.context.lineWidth = 0;
    this.context.stroke();
    this.context.fillStyle = `rgb(${this.red}, ${this.green}, ${this.blue})`;
    this.context.fill();
  }

  impactedBoundery() {
    // Stub method for super classes
  }

  impactedRight() {
    this.impactedBoundery();
    // Stub method for super classes
  }

  impactedLeft() {
    this.impactedBoundery();
    // Stub method for super classes
  }

  impactedBottom() {
    this.impactedBoundery();
    // Stub method for super classes
  }

  impactedTop() {
    this.impactedBoundery();
    // Stub method for super classes
  }

  move() {
    if (this.mouthOpen > 1) {
      this.mouthOpening = false;
    } else if (this.mouthOpen < 0) {
      this.mouthOpening = true;
    }

    if (this.mouthOpening) {
      this.mouthOpen += 0.05 * this.mouthSpeed;
    } else {
      this.mouthOpen -= 0.05 * this.mouthSpeed;
    }

    if (this.right() + this.dx > window.innerWidth) {
      this.dx = -Math.abs(this.dx);
      this.x = window.innerWidth - this.radius;
      this.impactedRight();
    } else if (this.left() + this.dx < 0) {
      this.dx = Math.abs(this.dx);
      this.x = this.radius;
      this.impactedLeft();
    } else {
      this.x += this.dx;
    }

    if (this.bottom() + this.dy > window.innerHeight) {
      this.dy = -Math.abs(this.dy);
      this.y = window.innerHeight - this.radius;
      this.impactedBottom();
    } else if (this.top() + this.dy < 0) {
      this.dy = Math.abs(this.dy);
      this.y = this.radius;
      this.impactedTop();
    } else {
      this.y += this.dy;
    }
  }

  update() {
    this.draw();
    this.move();
  }
}

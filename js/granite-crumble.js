var canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var c = canvas.getContext('2d');

class Crack {
  constructor({segmentCount = 2, maxSize = 100, red = 0, green = 0, blue = 0, opacity = 0.1, breakSpeed = 0} = {}) {
    this.maxSize = maxSize;
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.opacity = opacity;
    this.breakSpeed = breakSpeed;
    this.nextEndBreak = 0;
    this.nextStartBreak = 0;
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
    var newX = randomNumber({min: 1, max: this.maxSize}) * positiveOrNegative();
    var newY = randomNumber({min: 1, max: this.maxSize}) * positiveOrNegative();
    var startPoint = this.points[0];
    var startX = from.x;
    var startY = from.y;
    var x = this.startX + newX > window.innerWidth ? startX - newX : startX + newX;
    var y = this.startY + newY > window.innerWidth ? startX - newY : startY + newY;
    this.points.push({ x: x, y: y });
  }

  draw() {
    c.beginPath();
    this.points.forEach(point => c.lineTo(point.x, point.y));
    c.strokeStyle = `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.opacity})`;
    c.stroke();
  }

  update() {
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

var cracks = [];
var crackCount = 5;

for (var i = 0; i < crackCount; i++) {
  cracks.push(new Crack({
    segmentCount: randomSegmentCount(10),
    maxSize: 50,
    opacity: 0.5,
    breakSpeed: 0.1
  }));
}

function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, window.innerWidth, window.innerHeight);
  cracks.forEach(crack => crack.update());
}

animate();

function positiveOrNegative() {
  return Math.random() > 0.5 ? 1 : -1;
}

function randomNumber({min = 1, max = 100}) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomSegmentCount(segmentCount = 3) {
  return Math.ceil(Math.random() * segmentCount);
}

function randomY() {
  return Math.random() * window.innerHeight;
}

function randomX() {
  return Math.random() * window.innerWidth;
}

var canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var c = canvas.getContext('2d');

class Crack {
  constructor({segmentCount = 2, maxSize = 100, red = 0, green = 0, blue = 0, opacity = 0.1} = {}) {
    this.points = [];

    var x = randomX();
    var y = randomY();

    for (var i=0; i < segmentCount+1; i++) {
      var newX = randomNumber({min: 1, max: maxSize}) * positiveOrNegative();
      var newY = randomNumber({min: 1, max: maxSize}) * positiveOrNegative();
      x = x + newX > window.innerWidth ? x = x - newX : x = x + newX;
      y = y + newY > window.innerWidth ? y = y - newY : y = y + newY;
      this.points.push({ x: x, y: y });
    }

    this.red = red;
    this.green = green;
    this.blue = blue;
    this.opacity = opacity;
  }

  draw() {
    c.beginPath();
    this.points.forEach(point => c.lineTo(point.x, point.y));
    c.strokeStyle = `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.opacity})`;
    c.stroke();
  }

  update() {
    this.draw();
  }
}

var cracks = [];
var crackCount = randomNumber({min: 300, max: 400});

for (var i = 0; i < crackCount; i++) {
  cracks.push(new Crack({ segmentCount: randomSegmentCount(), maxSize: 50, opacity: 0.1 }));
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

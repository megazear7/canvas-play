var canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var c = canvas.getContext('2d');

class Crack {
  constructor({segmentCount = 2} = {}) {
    this.points = [];

    for (var i=0; i < segmentCount+1; i++) {
      this.points.push({
        x: randomX(),
        y: randomY()
      });
    }
  }

  draw() {
    c.beginPath();
    this.points.forEach(point => c.lineTo(point.x, point.y));
    c.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    c.stroke();
  }

  update() {
    this.draw();
  }
}


var cracks = [];
var crackCount = randomNumber({min: 4, max: 7});

for (var i = 0; i < crackCount; i++) {
  cracks.push(new Crack({segmentCount: randomSegmentCount()}));
}

function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, window.innerWidth, window.innerHeight);
  cracks.forEach(crack => crack.update());
}

animate();

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

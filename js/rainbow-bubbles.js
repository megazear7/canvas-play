var canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var c = canvas.getContext('2d');
var mousePosition = {x: 0, y: 0};

/* Rectangles
c.fillStyle = 'rgba(255, 0, 0, 0.5)';
c.fillRect(100, 100, 100, 100);
c.fillStyle = 'rgba(0, 255, 0, 0.5)';
c.fillRect(220, 250, 100, 100);
c.fillStyle = 'rgba(0, 0, 255, 0.5)';
c.fillRect(400, 300, 100, 100);
*/

/* Line
c.beginPath();
c.moveTo(50, 300);
c.lineTo(400, 500);
c.lineTo(500, 100);
c.strokeStyle = 'rgba(255, 0, 0, 0.5)';
c.stroke();
*/

class Ball {
  constructor({
              x = randomX(),
              y = randomY(),
              dx = randomSpeed(10),
              dy = randomSpeed(10),
              red = randomColor(),
              green = randomColor(),
              blue = randomColor(),
              radius = (Math.random() * 40) + 10,
              speed = 1
            } = {}) {
    this.x = x;
    this.y = y;
    this.dx = dx * speed;
    this.dy = dy * speed;
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.radius = radius;
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
    drawCircle({x: this.x, y: this.y, radius: this.radius, width: 5, lineWidth: 0, red: this.red, green: this.green, blue: this.blue});
  }

  move() {
    if (this.right() > window.innerWidth) {
      this.dx = -Math.abs(this.dx);
    }

    if (this.left() < 0) {
      this.dx = Math.abs(this.dx);
    }

    if (this.bottom() > window.innerHeight) {
      this.dy = -Math.abs(this.dy);
    }

    if (this.top() < 0) {
      this.dy = Math.abs(this.dy);
    }

    this.x += this.dx;
    this.y += this.dy;
  }

  update() {
    this.draw();
    this.move();
  }
}

class Bubble extends Ball {
  constructor(props) {
    super(props);
    this.radius = 20;
  }

  draw() {
    var distance = getDistance(mousePosition.x, mousePosition.y, this.x, this.y);
    this.radius = Math.max(100 - distance, 10);
    super.draw();
  }
}

var balls = [];
var ballCount = 200;
for (var i=0; i < ballCount; i++){
  balls.push(new Bubble({speed: 0.5}));
}

function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, window.innerWidth, window.innerHeight);
  balls.forEach(ball => ball.update());
}

canvas.addEventListener('mousemove', event => {
  mousePosition = getMousePos(event);
}, false);

animate();

/* ----------------- */
/* Utility Functions */
function getMousePos(event) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

function getDistance(x1, y1, x2, y2) {
  var a = x1 - x2;
  var b = y1 - y2;
  return Math.sqrt( a*a + b*b );
}

function drawCircle({x = 0, y = 0, radius = 30, lineWidth = 1, width = 5, red = 0, green = 0, blue = 0, opacity = 1}) {
  c.beginPath();
  c.arc(x, y, radius, 0, Math.PI * 2, false);
  c.lineWidth = lineWidth;
  c.stroke();
  c.fillStyle = `rgba(${red}, ${green}, ${blue}, 0.5)`;
  c.fill();
}

function randomColor() {
  return Math.random() * 255;
}

function randomSpeed(multiplier = 3) {
  return (Math.random() - 0.5) * multiplier;
}

function randomY() {
  return Math.random() * window.innerHeight;
}

function randomX() {
  return Math.random() * window.innerWidth;
}

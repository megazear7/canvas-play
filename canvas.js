var canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var c = canvas.getContext('2d');

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

/* Circle
c.beginPath();
c.arc(300, 100, 30, 0, Math.PI * 2, false);
c.strokeStyle = 'rgba(255, 0, 255, 0.5)';
c.stroke();
*/

/*
var circleCount = 50;
for (var i=0; i < circleCount; i++){
  drawCircle(randomX(), randomY(), 30, randomColor(), randomColor(), randomColor());
}
*/

var balls = [];
var ballCount = 10;
for (var i=0; i < ballCount; i++){
  balls.push(createBall(200, 200));
}

function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, window.innerWidth, window.innerHeight);
  balls.forEach(ball => ball.update());
}

animate();

/* ----------------- */
/* Utility Functions */
function drawCircle(x, y, radius = 30, width = 5, red = 0, green = 0, blue = 0, opacity = 1) {
  c.beginPath();
  c.arc(x, y, radius, 0, Math.PI * 2, false);
  c.lineWidth = 10;
  c.strokeStyle = `rgba(${red}, ${green}, ${blue}, 0.5)`;
  c.stroke();
}

function createBall(x = randomX(), y = randomY(), dx = randomSpeed(20), dy = randomSpeed(20), red = randomColor(), green = randomColor(), blue = randomColor(), radius = (Math.random() * 40) + 10) {
  return {
    x: x,
    y: y,
    dx: dx,
    dy: dy,
    red: randomColor(),
    green: randomColor(),
    blue: randomColor(),
    radius: (Math.random() * 40) + 10,
    right: function() {
      return this.x + this.radius;
    },
    left: function() {
      return this.x - this.radius;
    },
    bottom: function() {
      return this.y + this.radius;
    },
    top: function() {
      return this.y - this.radius;
    },
    draw: function() {
      drawCircle(this.x, this.y, this.radius, 5, this.red, this.green, this.blue);
    },
    move: function() {
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
    },
    update: function() {
      this.draw();
      this.move();
    }
  };
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

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

var x = randomX();
var y = randomY();
var dx = randomSpeed(20);
var dy = randomSpeed(20);
var radius = 30;

function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, innerWidth, innerHeight);
  drawCircle(x, y, radius, dx, dy);

  if (x + radius > innerWidth || x - radius < 0) {
    dx = -dx;
  }

  if (y + radius > innerHeight || y - radius < 0) {
    dy = -dy;
  }

  x += dx;
  y += dy;
}

animate();

/* ----------------- */
/* Utility Functions */
function drawCircle(x, y, radius, red, green, blue) {
  c.beginPath();
  c.arc(x, y, radius, 0, Math.PI * 2, false);
  c.strokeStyle = `rgba(${red}, ${green}, ${blue}, 0.5)`;
  c.stroke();
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

import { randomY } from '/js/utility.js';
import Crack from '/js/objects/crack.js';

var canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var c = canvas.getContext('2d');

var crack = new Crack({
    context: c,
    startX: 0,
    startY: (randomY() / 2) + (window.innerHeight / 4),
    segmentCount: 1,
    breakSize: 10,
    opacity: 0.5,
    breakSpeed: 1,
    startGrows: false,
    endGrowHorizontalDir: 1,
    stayBounded: true
});

function fillBelow() {
  c.beginPath();
  crack.points.forEach(point => c.lineTo(point.x, point.y));
  c.lineTo(window.innerWidth, window.innerHeight);
  c.lineTo(0, window.innerHeight);
  c.lineTo(crack.startPoint.x, crack.startPoint.y);
  c.fillStyle = `rgba(0, 0, 0)`;
  c.fillStyle = 'rgb(0, 0, 0, 0.1)';
  c.fill();
  c.strokeStyle = `rgba(0, 0, 0)`;
  c.stroke();
}

function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, window.innerWidth, window.innerHeight);
  crack.update();

  if (crack.reachedEdge) {
    crack.doUpdate = false;
    fillBelow();
  } else {
    c.fillStyle = 'rgb(0, 0, 0, 0.1)';
    c.fillRect(0, 0, window.innerWidth, window.innerHeight);
  }
}

animate();

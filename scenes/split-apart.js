import { fillAbove, fillBelow, randomY } from '/js/utility.js';
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
    breakSpeed: 0.3,
    breakAcceleration: 0.04,
    startGrows: false,
    endGrowHorizontalDir: 1,
    stayBounded: true
});

var gap = 0;
var gapSpeed = 3;
var gapAcceleration = 0.2;

function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, window.innerWidth, window.innerHeight);
  crack.update();

  if (crack.reachedEdge) {
    crack.doUpdate = false;
    crack.render = false;
    gap += gapSpeed;
    gapSpeed += gapAcceleration;
    fillBelow(c, crack.points, gap);
    fillAbove(c, crack.points, gap);
  } else {
    c.fillStyle = 'rgb(0, 0, 0, 0.1)';
    c.fillRect(0, 0, window.innerWidth, window.innerHeight);
  }
}

animate();

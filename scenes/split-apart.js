import { fillAbove, fillBelow, randomY } from '/js/utility.js';
import Crack from '/js/objects/crack.js';

/* Setup */
var canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var c = canvas.getContext('2d');

/* Configuration options */
var crack = new Crack({
    context: c,
    startX: 0,
    startY: (randomY() / 2) + (window.innerHeight / 4),
    segmentCount: 1,
    breakSize: 10,
    opacity: 0.5,
    breakSpeed: 1,
    breakAcceleration: 0.1,
    startGrows: false,
    endGrowHorizontalDir: 1,
    stayBounded: true
});

var gap = 0;
var gapSpeed = 1;
var gapAcceleration = 0.1;

/* Animation Sequence */
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

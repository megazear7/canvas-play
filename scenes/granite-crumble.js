import Crack from '/js/objects/crack.js';
import { randomSegmentCount } from '/js/utility.js';

var canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var c = canvas.getContext('2d');

var cracks = [];
var crackCount = 5;

for (var i = 0; i < crackCount; i++) {
  cracks.push(new Crack({
    context: c,
    segmentCount: randomSegmentCount(10),
    breakSize: 50,
    opacity: 0.5,
    breakSpeed: 0.01,
    breakAcceleration: 0.01
  }));
}

function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, window.innerWidth, window.innerHeight);
  cracks.forEach(crack => crack.update());
}

animate();

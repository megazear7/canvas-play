import Crack from '/js/objects/crack.js';
import { randomSegmentCount } from '/js/utility.js';
import canvas from '/js/full-canvas.js';

var context = canvas.getContext('2d');
var cracks = [];
var crackCount = window.innerWidth / 25;

for (var i = 0; i < crackCount; i++) {
  cracks.push(new Crack({
    context: context,
    segmentCount: randomSegmentCount(10),
    breakSize: 50,
    opacity: 0.5,
    breakSpeed: 0.01,
    breakAcceleration: 0.01
  }));
}

function animate() {
  requestAnimationFrame(animate);
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  cracks.forEach(crack => crack.update());
}

setTimeout(() => {
  cracks.forEach(crack => crack.doUpdate = false);
}, 1500);

animate();

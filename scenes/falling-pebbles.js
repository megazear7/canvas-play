import Pebble from '/js/objects/pebble.js';
import canvas from '/js/full-canvas.js';

var context = canvas.getContext('2d');
var pebbles = [];
var pebbleCount = 1;

for (var i = 0; i < pebbleCount; i++) {
  pebbles.push(new Pebble({
    context: context,
    speed: 0.5,
    radius: (Math.random() * 80) + 20,
    minRadius: (Math.random() * 20) + 5
  }));
}

function animate() {
  requestAnimationFrame(animate);
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  pebbles.forEach(bubble => bubble.update());
}

animate();

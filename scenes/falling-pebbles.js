import Pebble from '/js/objects/pebble.js';
import canvas from '/js/full-canvas.js';

var context = canvas.getContext('2d');
var pebbles = [];
var pebbleCount = 100;

for (var i = 0; i < pebbleCount; i++) {
  pebbles.push(new Pebble({
    context: context,
    speed: 0.5,
    weight: 0.3,
    radius: (Math.random() * 10) + 5
  }));
}

function animate() {
  requestAnimationFrame(animate);
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  pebbles.forEach(pebble => pebble.update());
}

animate();

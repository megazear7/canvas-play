import Bubble from '/js/objects/bubble.js';
import { getMousePos } from '/js/utility.js';
import canvas from '/js/full-canvas.js';

var context = canvas.getContext('2d');
var mousePosition = {x: 0, y: 0};
var bubbles = [];
var bubbleCount = 300;

for (var i = 0; i < bubbleCount; i++) {
  bubbles.push(new Bubble({
    context: context,
    speed: 0.5,
    mousePosition: mousePosition,
    radius: (Math.random() * 80) + 20,
    minRadius: (Math.random() * 20) + 5
  }));
}

function animate() {
  requestAnimationFrame(animate);
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  bubbles.forEach(bubble => bubble.update(mousePosition));
}

canvas.addEventListener('mousemove', event => {
  mousePosition = getMousePos(canvas, event);
}, false);

animate();

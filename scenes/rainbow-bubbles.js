import Bubble from '/js/objects/bubble.js';
import { getMousePos } from '/js/utility.js';

var canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var c = canvas.getContext('2d');

var mousePosition = {x: 0, y: 0};

var bubbles = [];
var bubbleCount = 200;
for (var i=0; i < bubbleCount; i++){
  bubbles.push(new Bubble({context: c, speed: 0.5, mousePosition: mousePosition}));
}

function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, window.innerWidth, window.innerHeight);
  bubbles.forEach(bubble => bubble.update(mousePosition));
}

canvas.addEventListener('mousemove', event => {
  mousePosition = getMousePos(canvas, event);
}, false);

animate();

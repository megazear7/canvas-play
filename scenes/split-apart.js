import Crack from '/js/objects/crack.js';

var canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var c = canvas.getContext('2d');

var crack = new Crack({
    context: c,
    segmentCount: 10,
    maxSize: 50,
    opacity: 0.5,
    breakSpeed: 0.01,
    breakAcceleration: 0.01,
    startGrows: false
});

function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, window.innerWidth, window.innerHeight);
  crack.update();
}

animate();

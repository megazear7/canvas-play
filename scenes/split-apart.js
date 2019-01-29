import Crack from '/js/objects/crack.js';

var canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var c = canvas.getContext('2d');

var crack = new Crack({
    context: c,
    startX: 0,
    segmentCount: 3,
    maxSize: 20,
    opacity: 0.5,
    breakSpeed: 0.1,
    startGrows: false,
    endGrowHorizontalDir: 1,
    stayBounded: true
});

function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, window.innerWidth, window.innerHeight);
  crack.update();
}

animate();

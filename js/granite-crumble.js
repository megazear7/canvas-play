var canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var c = canvas.getContext('2d');

c.beginPath();

var segmentCount = 1;
for (var i=0; i < segmentCount+1; i++){
  c.lineTo(randomX(), randomY());
}

c.strokeStyle = 'rgba(255, 0, 0, 0.5)';
c.stroke();

function randomY() {
  return Math.random() * window.innerHeight;
}

function randomX() {
  return Math.random() * window.innerWidth;
}

var canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var c = canvas.getContext('2d');

var segmentCount = 2;
var lineCount = 5;

for (var j=0; j < lineCount; j++) {
  c.beginPath();
  for (var i=0; i < segmentCount+1; i++) {
    c.lineTo(randomX(), randomY());
  }
  c.strokeStyle = 'rgba(255, 0, 0, 0.5)';
  c.stroke();
}

function randomY() {
  return Math.random() * window.innerHeight;
}

function randomX() {
  return Math.random() * window.innerWidth;
}

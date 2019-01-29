import { fillPoints, randomY } from '/js/utility.js';
import Crack from '/js/objects/crack.js';

var canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var c = canvas.getContext('2d');

var gap = 0;
var gapSpeed = 0;
var gapAcceleration = 0.2;
var opacity = 0.3;

var crack = new Crack({
    context: c,
    startX: 0,
    startY: (randomY() / 4) + (window.innerHeight * (3/8)),
    segmentCount: 1,
    breakSize: 10,
    opacity: Math.min(opacity * 2, 1),
    breakSpeed: 0,
    breakAcceleration: 0.05,
    startGrows: false,
    endGrowHorizontalDir: 1,
    stayBounded: true
});

function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, window.innerWidth, window.innerHeight);
  crack.update();

  if (crack.reachedEdge) {
    crack.doUpdate = false;
    crack.render = false;
    gap += gapSpeed;
    gapSpeed += gapAcceleration;

    var belowPoints = Array.from(crack.points);
    belowPoints.push({x: window.innerWidth, y: window.innerHeight});
    belowPoints.push({x: 0, y: window.innerHeight});
    fillPoints({
      context: c,
      points: belowPoints,
      shift: gap,
      lineOpacity: 0,
      fillOpacity: opacity
    });

    var abovePoints = Array.from(crack.points);
    abovePoints.push({x: window.innerWidth, y: 0});
    abovePoints.push({x: 0, y: 0});
    fillPoints({
      context: c,
      points: abovePoints,
      shift: -gap,
      lineOpacity: 0,
      fillOpacity: opacity
    });

  } else {
    c.fillStyle = `rgb(0, 0, 0, ${opacity})`;
    c.fillRect(0, 0, window.innerWidth, window.innerHeight);
  }
}

animate();

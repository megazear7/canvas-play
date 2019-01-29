import { fillPoints, randomY } from '/js/utility.js';
import Crack from '/js/objects/crack.js';
import canvas from '/js/full-canvas.js';
var context = canvas.getContext('2d');

var gap = 0;
var gapSpeed = 0;
var gapAcceleration = 0.2;
var opacity = 0.3;

var crack = new Crack({
    context: context,
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
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
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
      context: context,
      points: belowPoints,
      shift: gap,
      lineOpacity: 0,
      fillOpacity: opacity
    });

    var abovePoints = Array.from(crack.points);
    abovePoints.push({x: window.innerWidth, y: 0});
    abovePoints.push({x: 0, y: 0});
    fillPoints({
      context: context,
      points: abovePoints,
      shift: -gap,
      lineOpacity: 0,
      fillOpacity: opacity
    });

  } else {
    context.fillStyle = `rgb(0, 0, 0, ${opacity})`;
    context.fillRect(0, 0, window.innerWidth, window.innerHeight);
  }
}

animate();

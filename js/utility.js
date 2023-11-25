export function positiveOrNegative() {
  return Math.random() > 0.5 ? 1 : -1;
}

export function randomNumber({min = 1, max = 100}) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomSegmentCount(segmentCount = 3) {
  return Math.ceil(Math.random() * segmentCount);
}

export function randomY() {
  return Math.random() * window.innerHeight;
}

export function randomX() {
  return Math.random() * window.innerWidth;
}

export function getDistance(x1, y1, x2, y2) {
  var a = x1 - x2;
  var b = y1 - y2;
  return Math.sqrt( a*a + b*b );
}

export function getDistancePts(p1, p2) {
  var a = p1.x - p2.x;
  var b = p1.y - p2.y;
  return Math.sqrt( a*a + b*b );
}

export function drawRect2({
  context,
  center,
  width,
  height,
  fillStyle = 'rgba(0,0,0,1)',
  lineStyle = 'rgba(0,0,0,0)',
  lineWidth = 1
}) {
  const points = [
    {
      x: center.x - width / 2,
      y: center.y - height / 2
    },
    {
      x: center.x + width / 2,
      y: center.y - height / 2
    },
    {
      x: center.x + width / 2,
      y: center.y + height / 2
    },
    {
      x: center.x - width / 2,
      y: center.y + height / 2
    }
  ]
  context.beginPath();
  points.forEach(point => context.lineTo(point.x, point.y));
  context.lineTo(points[0].x, points[0].y);
  context.fillStyle = fillStyle;
  context.fill();
  context.lineWidth = lineWidth;
  context.strokeStyle = lineStyle;
  context.stroke();
}

export function isOffScreen(canvas, p) {
  return p.x > canvas.width ||
         p.y > canvas.height ||
         p.x < 0 ||
         p.y < 0;
}

export function drawRect({
  context,
  x = 0,
  y = 0,
  w = 1,
  h = 1,
  r = 0,
  g = 0,
  b = 0,
  a = 1,
  rotate = 0
}) {
  context.rotate((rotate * Math.PI) / 180);
  context.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
  context.fillRect(x, y, w, h);
  context.rotate((-rotate * Math.PI) / 180);
}

export function drawCircle({
  context,
  x = 0,
  y = 0,
  radius = 30,
  lineWidth = 1,
  lineStyle = `rgba(0, 0, 0, 1)`,
  red = 0,
  green = 0,
  blue = 0,
  opacity = 1
}) {
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2, false);
  context.lineWidth = lineWidth;
  context.strokeStyle = lineStyle;
  context.stroke();
  context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${opacity})`;
  context.fill();
}

export function drawArc({
  context,
  x = 0,
  y = 0,
  radius = 30,
  lineWidth = 1,
  lineStyle = `rgba(0, 0, 0, 1)`,
  percent = 100
}) {
  context.beginPath();
  context.arc(x, y, radius, 0, (Math.PI * 2) * (percent / 100), false);
  context.lineWidth = lineWidth;
  context.strokeStyle = lineStyle;
  context.stroke();
}

export function drawDot({
            context,
            x = 0,
            y = 0,
            radius = 30,
            lineWidth = 1,
            lineStyle = `rgba(0, 0, 0, 1)`,
            color = `rgba(0, 0, 0, 1)`}) {
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2, false);
  context.lineWidth = lineWidth;
  context.strokeStyle = lineStyle;
  context.stroke();
  context.fillStyle = color;
  context.fill();
}

export function randomSpeed(multiplier = 3) {
  return (Math.random() - 0.5) * multiplier;
}

export function randomColor() {
  return Math.random() * 255;
}

export function getMousePos(canvas, event) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

export function polygon({
  context,
  points,
  shift,
  fillRed = 0,
  fillGreen = 0,
  fillBlue = 0,
  fillOpacity = 1,
  lineRed = 0,
  lineGreen = 0,
  lineBlue = 0,
  lineOpacity = 1
}) {
  //iterate through all points and calculate the center, c
  var c = {x:0, y:0}, p;
  points.forEach(p => {
      c.x+=p.x;
      c.y+=p.y;
  });

  c.x/=points.length;
  c.y/=points.length;


  points.sort((p1, p2) => {
      var dx1 = p1.x-c.x;
      var dy1 = p1.y-c.y;
      var a1 = Math.atan2(dy1, dx1);

      var dx2 = p2.x-c.x;
      var dy2 = p2.y-c.y;
      var a2 = Math.atan2(dy2, dx2);

      //If angles are the same, sort by length
      if (a1===a2){
          var d1 = dx1*dx1 + dy1*dy1;
          var d2 = dx2*dx2 + dy2*dy2;

          return d1-d2;
      }

      //otherwise sort by angle
      return a1-a2;
  });

  //Iterate through all Points and draw lines between them
  fillPoints({
    context,
    points,
    shift,
    fillRed,
    fillGreen,
    fillBlue,
    fillOpacity,
    lineRed,
    lineGreen,
    lineBlue,
    lineOpacity
  });
}

export function fillPoints({
  context,
  points,
  shift,
  fillRed = 0,
  fillGreen = 0,
  fillBlue = 0,
  fillOpacity = 1,
  lineRed = 0,
  lineGreen = 0,
  lineBlue = 0,
  lineOpacity = 1
} = {}) {
  context.beginPath();
  points.forEach(point => context.lineTo(point.x, point.y + shift));
  context.lineTo(points[0].x, points[points.length-1].y);
  context.fillStyle = `rgba(${fillRed}, ${fillGreen}, ${fillBlue}, ${fillOpacity})`;
  context.fill();
  context.strokeStyle = `rgba(${lineRed}, ${lineGreen}, ${lineBlue}, ${lineOpacity})`;
  context.stroke();
}

/** @function approachValue
 *  Returns the current value a percentage distance towards the target as
 *  specified by the move */
export function approachValue(current, target, relativeMove) {
  var diff = target - current;
  var absoluteMove = diff * relativeMove;
  return current + absoluteMove;
}

/** @function movePoint
 *  Returns a new point moved from p1 towards p2 with an easing function applied
 *  based upon the original starting point p0. The speed of the movement is scalled by speedScale.
 */
export function movePoint(p0, p1, p2, speedScale) {
  var xDiff = p2.x - p1.x;
  var yDiff = p2.y - p1.y;
  var xTotal = Math.abs(p2.x - p0.x);
  var yTotal = Math.abs(p2.y - p0.y);

  var newX;
  if (xTotal > 0) {
    var xSpeedAdjust = Math.pow(Math.abs(Math.sin((Math.abs(xDiff) / xTotal) * Math.PI)), 1/3);
    var xMove = xDiff * speedScale * xSpeedAdjust;
    newX = p1.x + xMove;
  } else {
    newX = p2.x;
  }

  var newY;
  if (yTotal > 0) {
    var ySpeedAdjust = Math.pow(Math.abs(Math.sin((Math.abs(yDiff) / yTotal) * Math.PI)), 1/3);
    var yMove = yDiff * speedScale * ySpeedAdjust;
    newY = p1.y + yMove;
  } else {
    newY = p2.y;
  }

  return {
    x: newX,
    y: newY
  };
}

export function distanceBetween(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

export function drawLine(context, p1, p2, thickness, color) {
  context.beginPath();
  context.lineWidth = thickness;
  context.strokeStyle = color;
  context.lineTo(p1.x, p1.y);
  context.lineTo(p2.x, p2.y);
  context.stroke();
}

export function movePoint2(p1, p2, v, agility, maxSpeed) {
  const p3 = addVectors(p1, v);
  const p4 = pointAlong(p3, p2, agility, false, true);
  const p5 = pointAlong(p1, p4, maxSpeed, false, false);
  const v1 = subtractVectors(p5, p1);
  return v1;
}

/**
 * @return A new point at a distance d from p1 along the path to p2
 *         or p2 if the two points are closer than d from each other
 */
export function pointAlong(p1, p2, d, allowOvershoot, log) {
  const fullDistance = distanceBetween(p1, p2);
  if (fullDistance > d || allowOvershoot) {
    const p1P2Delta = subtractVectors(p2, p1);
    const percentageOfDistance = d / fullDistance;
    const distanceMod = percentageOfDistance < 1 ? percentageOfDistance : 1;
    return {
      x: p1.x + (p1P2Delta.x * distanceMod),
      y: p1.y + (p1P2Delta.y * distanceMod),
    };
  } else {
    return p2;
  }
}

export function magnitude(v) {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

export function addVectors(v1, v2) {
  return {
    x: v1.x + v2.x,
    y: v1.y + v2.y
  }
}

export function subtractVectors(v1, v2) {
  return {
    x: v1.x - v2.x,
    y: v1.y - v2.y
  }
}

export function parseLineAttr(lineAttr, defaultThickness, defaultSpeed) {
  let points = lineAttr.split(/\s+/).map(stringNumber => parseFloat(stringNumber));
  return {
    p1: {
      x: points[0],
      y: points[1]
    },
    p2: {
      x: points[2],
      y: points[3]
    },
    thickness: points.length > 4 ? points[4] : defaultThickness,
    speed: points.length > 5 ? points[5] : defaultSpeed
  };
}

// Above or below 1 by the provided amount
export function percentAdjust(percent) {
  return Math.random() * (percent * 2) + (1 - percent);
}

export function writeText({
  context,
  text = 'Hello world',
  font = "sans-serif",
  size = "12px",
  red = 0,
  green = 0,
  blue = 0,
  opacity = 1,
  x = 0,
  y = 0
}) {
  context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${opacity})`;
  context.font = size + ' ' + font;
  context.fillText(text, x, y);
}

export function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

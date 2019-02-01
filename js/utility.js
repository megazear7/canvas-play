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

export function drawCircle({
            context,
            x = 0,
            y = 0,
            radius = 30,
            lineWidth = 1,
            width = 5,
            lineStyle = `rgba(0, 0, 0, 1)`,
            red = 0,
            green = 0,
            blue = 0,
            opacity = 1}) {
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2, false);
  context.lineWidth = lineWidth;
  context.strokeStyle = lineStyle;
  context.stroke();
  context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${opacity})`;
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
          lineOpacity = 1} = {}) {
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
 *  Returns a new point that is directly between p1 and p2
 *  and has moved the specified percentage between them.
 *  If the percentage move is ever less than the provided absoluteMin the point will
 *  move to the target.
 */
export function movePoint(p1, p2, move, absoluteMin = 0) {
  var xDiff = p1.x - p2.x;
  var yDiff = p1.y - p2.y;
  var xMove = -xDiff * move;
  var yMove = -yDiff * move;

  var newPoint = {
    x: p1.x + xMove,
    y: p1.y + yMove
  };

  var newXDiff = newPoint.x - p2.x;
  var newYDiff = newPoint.y - p2.y;

  if (Math.abs(newXDiff) < absoluteMin) {
    newPoint.x = p2.x;
  }

  if (Math.abs(newYDiff) < absoluteMin) {
    newPoint.y = p2.y;
  }

  return newPoint;
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

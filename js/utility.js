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

export function drawCircle({context, x = 0, y = 0, radius = 30, lineWidth = 1, width = 5, red = 0, green = 0, blue = 0, opacity = 1}) {
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2, false);
  context.lineWidth = lineWidth;
  context.stroke();
  context.fillStyle = `rgba(${red}, ${green}, ${blue}, 0.5)`;
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

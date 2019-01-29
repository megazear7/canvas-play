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

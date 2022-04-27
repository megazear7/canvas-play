import { drawCircle, drawLine } from '../utility.js';

export default class HexGrid {
  constructor({
              context,
              red = 0,
              green = 0,
              blue = 0,
              sideLength = 20,
              gridSize = 10,
            } = {}) {
    this.context = context;
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.sideLength = sideLength;
    this.gridSize = gridSize;
    this.origin = {
      x: hexShiftX(this.context.canvas.width / 2, this.sideLength, -(this.gridSize)),
      y: this.context.canvas.height / 2,
    }
    this.points = {};

    var xstart = -(this.gridSize - 1);
    var xend = this.gridSize - 1;
    for (var x = xstart; x <= xend; x++) {
      var ystart;
      var yend;
      if (x >= 0) {
        ystart = x;
        yend = (2 * this.gridSize) - 2;
      } else {
        ystart = 0;
        yend = (2 * this.gridSize) + x - 2;
      }
      for (var y = ystart; y <= yend; y++) {
        const point = {
            x: this.origin.x + (Math.sqrt(3) * this.sideLength * y) - ((x - xstart) * this.sideLength * (Math.sqrt(3)/2)),
            y: this.origin.y + ((3/2) * this.sideLength * -x)
        };

        this.points[[x      , y      ]] = hexPosA(point, this.sideLength);
        this.points[[x + 0.5, y + 0.5]] = hexPosB(point, this.sideLength);
        this.points[[x      , y +   1]] = hexPosC(point, this.sideLength);
        this.points[[x - 0.5, y + 0.5]] = hexPosD(point, this.sideLength);
        this.points[[x -   1, y      ]] = hexPosE(point, this.sideLength);
        this.points[[x - 0.5, y - 0.5]] = hexPosF(point, this.sideLength);
      }
    }
  }

  draw() {
    Object.keys(this.points).forEach(key => {
      const p1 = this.points[key];
      const numberingX = parseFloat(key.split(',')[0]);
      const numberingY = parseFloat(key.split(',')[1]);
      if (Number.isInteger(numberingX) && Number.isInteger(numberingY)) {
        const p2a = this.points[[numberingX + 0.5, numberingY + 0.5]];
        const p2b = this.points[[numberingX - 0.5, numberingY - 0.5]];
        const p2c = this.points[[numberingX + 0.5, numberingY - 0.5]];
        if (p2a) {
          drawLine(this.context, p1, p2a, 1, `rgb(${this.red},${this.green},${this.blue})`);
        }
        if (p2b) {
          drawLine(this.context, p1, p2b, 1, `rgb(${this.red},${this.green},${this.blue})`);
        }
        if (p2c) {
          drawLine(this.context, p1, p2c, 1, `rgb(${this.red},${this.green},${this.blue})`);
        }
      }
      drawCircle({context: this.context, x: p1.x, y: p1.y, radius: 2, lineWidth: 0, red: this.red, green: this.green, blue: this.blue});
    });
  }

  update() {
    this.draw();
  }
}

function hexPosA(point, s) {
  return {
      x: point.x,
      y: point.y
  }
}

function hexPosB(point, s) {
  return {
      x: hexShiftX(point.x, s, 1),
      y: hexShiftShortY(point.y, s, 1)
  }
}

function hexPosC(point, s) {
  return {
      x: hexShiftX(point.x, s, 2),
      y: point.y
  }
}

function hexPosD(point, s) {
  return {
      x: hexShiftX(point.x, s, 2),
      y: point.y + s
  }
}

function hexPosE(point, s) {
  return {
      x: hexShiftX(point.x, s, 1),
      y: hexShiftShortY(point.y + s, s, -1)
  }
}

function hexPosF(point, s) {
  return {
      x: point.x,
      y: point.y + s
  }
}

function hexShiftX(x, sideLength, direction) {
  return x + ((Math.sqrt(3) / 2) * sideLength * direction);
}

function hexShiftShortY(y, sideLength, direction) {
  return y + (0.5 * sideLength * direction * -1);
}

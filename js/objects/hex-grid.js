import { drawCircle } from '../utility.js';

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
    console.log(
      this.context.canvas.width / 2,
      hexShiftX(0, this.sideLength, -9),
    )
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

        this.points[(x      ).toFixed(1) + '_' + (y      ).toFixed(1)] = hexPosA(point, this.sideLength);
        this.points[(x + 0.5).toFixed(1) + '_' + (y + 0.5).toFixed(1)] = hexPosB(point, this.sideLength);
        this.points[(x      ).toFixed(1) + '_' + (y +   1).toFixed(1)] = hexPosC(point, this.sideLength);
        this.points[(x - 0.5).toFixed(1) + '_' + (y + 0.5).toFixed(1)] = hexPosD(point, this.sideLength);
        this.points[(x -   1).toFixed(1) + '_' + (y      ).toFixed(1)] = hexPosE(point, this.sideLength);
        this.points[(x - 0.5).toFixed(1) + '_' + (y - 0.5).toFixed(1)] = hexPosF(point, this.sideLength);
      }
    }
  }

  draw() {
    Object.keys(this.points).forEach(key => {
      const point = this.points[key];
      drawCircle({context: this.context, x: point.x, y: point.y, radius: 2, lineWidth: 0, red: this.red, green: this.green, blue: this.blue});
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

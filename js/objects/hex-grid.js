import { drawDot, drawLine, distanceBetween } from '../utility.js';

export default class HexGrid {
  constructor({
              context,
              sideLength = 50,
              gridSize = 3,
              dotSize = 5,
              hoverDotSize = 7,
              dragDotSize = 9,
              lineThickness = 4,
              cornerRgba = 'rgba(0,0,0,1)',
              sideRgba = 'rgba(0,0,0,1)',
              hoverRgba = 'rgba(0,200,0,1)',
              dragRgba = 'rgba(0,0,200,1)',
              showOrigin = false,
            } = {}) {
    this.context = context;
    this.sideLength = sideLength;
    this.gridSize = gridSize;
    this.dotSize = dotSize;
    this.hoverDotSize = hoverDotSize;
    this.dragDotSize = dragDotSize;
    this.lineThickness = lineThickness;
    this.cornerRgba = cornerRgba;
    this.sideRgba = sideRgba;
    this.hoverRgba = hoverRgba;
    this.dragRgba = dragRgba;
    this.showOrigin = showOrigin;
    this.origin = {
      x: this.context.canvas.width / 2,
      y: this.context.canvas.height / 2,
    }
    this.points = {};

    var xstart = -(this.gridSize - 1);
    var xend = this.gridSize - 1;
    for (var x = xstart; x <= xend; x++) {
      var ystart;
      var yend;
      if (x >= 0) {
        ystart = x - this.gridSize + 1;
        yend = (2 * this.gridSize) - 1 - this.gridSize;
      } else {
        ystart = -this.gridSize + 1;
        yend = (2 * this.gridSize) + x - 1 - this.gridSize;
      }
      for (var y = ystart; y <= yend; y++) {
        const point = {
            x: this.origin.x + (Math.sqrt(3) * this.sideLength * y) - (x * this.sideLength * (Math.sqrt(3)/2)),
            y: this.origin.y + ((3/2) * this.sideLength * -x)
        };

        // This method works but it does not give us a well defined mapping
        // From any hexagonal numbering to any x,y coordinate
        this.points[[x      , y      ]] = hexPosA(point, this.sideLength);
        this.points[[x + 0.5, y + 0.5]] = hexPosB(point, this.sideLength);
        this.points[[x      , y +   1]] = hexPosC(point, this.sideLength);
        this.points[[x - 0.5, y + 0.5]] = hexPosD(point, this.sideLength);
        this.points[[x -   1, y      ]] = hexPosE(point, this.sideLength);
        this.points[[x - 0.5, y - 0.5]] = hexPosF(point, this.sideLength);
      }
    }

    this.minX = undefined;
    this.minY = undefined;
    this.maxX = undefined;
    this.maxY = undefined;
    Object.keys(this.points).forEach(key => {
      if (typeof this.minX === 'undefined' || this.points[key].x < this.minX) {
        this.minX = this.points[key].x;
      }
      if (typeof this.maxX === 'undefined' || this.points[key].x > this.maxX) {
        this.maxX = this.points[key].x;
      }
      if (typeof this.minY === 'undefined' || this.points[key].y < this.minY) {
        this.minY = this.points[key].y;
      }
      if (typeof this.maxY === 'undefined' || this.points[key].y > this.maxY) {
        this.maxY = this.points[key].y;
      }
    });

    document.addEventListener('mousedown', e => {
      this.mouse = {
        x: e.clientX,
        y: e.clientY,
      };

      Object.keys(this.points).forEach(key => {
        if (!this.grabbing && this.mouse && distanceBetween(this.points[key], this.mouse) < this.sideLength / 4) {
          this.grabbing = key;
          this.points[key].color = this.dragRgba;
          this.points[key].size = this.dragDotSize;
        }
      });
    });

    document.addEventListener('mouseup', e => {
      this.grabbing = undefined;
    });

    document.addEventListener('mousemove', e => {
      this.mouse = {
        x: e.clientX,
        y: e.clientY,
      };

      if (this.grabbing) {
        let xPos = this.mouse.x;
        if (this.mouse.x > this.maxX) {
          xPos = this.maxX;
        } else if (this.mouse.x < this.minX) {
          xPos = this.minX;
        }
        let yPos = this.mouse.y;
        if (this.mouse.y > this.maxY) {
          yPos = this.maxY;
        } else if (this.mouse.y < this.minY) {
          yPos = this.minY;
        }
        this.points[this.grabbing].x = xPos;
        this.points[this.grabbing].y = yPos;
      } else {
        let hovering = false;
        Object.keys(this.points).forEach(key => {
          if (this.mouse && distanceBetween(this.points[key], this.mouse) < this.sideLength / 4) {
            document.querySelectorAll('*').forEach(elem => elem.style.cursor = "pointer");
            hovering = true;
            this.points[key].color = this.hoverRgba;
            this.points[key].size = this.hoverDotSize;
          } else {
            this.points[key].color = undefined;
            this.points[key].size = undefined;
          }
        });
        if (!hovering) {
          document.querySelectorAll('*').forEach(elem => elem.style.cursor = "auto");
        }
      }
    });
  }

  data() {
    const data = {};
    Object.keys(this.points).forEach(key => {
      data[key] = {
        x: this.points[key].x - this.minX,
        y: this.points[key].y - this.minY,
      }
    });

    return data;
  }

  draw() {
    if (this.showOrigin) {
      drawDot({context: this.context, x: this.origin.x, y: this.origin.y, radius: 10, lineWidth: 0, lineStyle: 'rgba(0, 0, 0, 0)', color: 'rgba(150, 150, 255)'});
    }
    Object.keys(this.points).forEach(key => this.drawLines(this.points, key));
    Object.keys(this.points).forEach(key => this.drawPoint(this.points, key, this.dotSize));
  }

  drawLines(points, key) {
    const p1 = points[key];
    const numberingX = parseFloat(key.split(',')[0]);
    const numberingY = parseFloat(key.split(',')[1]);
    if (Number.isInteger(numberingX) && Number.isInteger(numberingY)) {
      const p2a = points[[numberingX + 0.5, numberingY + 0.5]];
      const p2b = points[[numberingX - 0.5, numberingY - 0.5]];
      const p2c = points[[numberingX + 0.5, numberingY - 0.5]];
      if (p2a) {
        drawLine(this.context, p1, p2a, this.lineThickness, this.sideRgba);
      }
      if (p2b) {
        drawLine(this.context, p1, p2b, this.lineThickness, this.sideRgba);
      }
      if (p2c) {
        drawLine(this.context, p1, p2c, this.lineThickness, this.sideRgba);
      }
    }
  }

  drawPoint(points, key) {
    const p1 = points[key];
    const size = p1.size || this.dotSize;
    drawDot({context: this.context, x: p1.x, y: p1.y, radius: size, lineWidth: 0, lineStyle: 'rgba(0, 0, 0, 0)', color: p1.color || 'rgba(0,0,0,1)'});
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

/*
const pointsToAdd = [
  { x: x       , y: y       },
  { x: x + 0.5 , y: y + 0.5 },
  { x: x       , y: y + 1   },
  //{ x: x - 0.5 , y: y + 0.5 },
  { x: x - 1   , y: y       },
  //{ x: x - 0.5 , y: y - 0.5 },
];

// The LONG TERM goal of this is to have a mapping from the hexagonal mapping
// to x,y coordinates that is well defined for all real numbers
pointsToAdd.forEach(pointsToAdd => {
  const delta = findCoordinates2(pointsToAdd, this.sideLength);
  this.points2[[pointsToAdd.x, pointsToAdd.y]] = {
    x: point.x + delta.x,
    y: point.y + delta.y,
  };
});

function isRight(x) {
  if (x >= 0) {
    return Math.abs(x) % 1 <= 0.5 && Math.abs(x) % 1 !== 0;
  } else {
    return Math.abs(x) % 1 > 0.5 || Math.abs(x) % 1 === 0;
  }
}

function isLeft(x) {
  if (x >= 0) {
    return Math.abs(x) % 1 > 0.5 || Math.abs(x) % 1 === 0;
  } else {
    return Math.abs(x) % 1 <= 0.5 && Math.abs(x) % 1 !== 0;
  }
}

function shiftDown(point, sideLength, count) {
  return {
    x: point.x,
    y: point.y + (sideLength * count)
  }
}

function shiftUp(point, sideLength, count) {
  return {
    x: point.x,
    y: point.y - (sideLength * count)
  }
}

function shiftDownRight(point, sideLength, count) {
  return {
    x: point.x + (Math.sqrt(3) * sideLength * count),
    y: point.y + ((1/2) * sideLength * count)
  }
}

function shiftUpRight(point, sideLength, count) {
  return {
    x: point.x + (Math.sqrt(3) * sideLength * count),
    y: point.y - ((1/2) * sideLength * count)
  }
}

function shiftDownLeft(point, sideLength, count) {
  return {
    x: point.x - (Math.sqrt(3) * sideLength * count),
    y: point.y + ((1/2) * sideLength * count)
  }
}

function shiftUpLeft(point, sideLength, count) {
  return {
    x: point.x - (Math.sqrt(3) * sideLength * count),
    y: point.y - ((1/2) * sideLength * count)
  }
}

function findCoordinates3(point, sideLength) {
  // New strategy, determine how many shifts we need to make
  const shiftDownCount = 0;
  const shiftUpCount = 0;
  const shiftDownRightCount = 0;
  const shiftUpRightCount = 0;
  const shiftDownLeftCount = 0;
  const shiftUpLeftCount = 0;

  point = shiftDown(point, sideLength, shiftDownCount);
  point = shiftUp(point, sideLength, shiftUpCount);
  point = shiftDownRight(point, sideLength, shiftDownRightCount);
  point = shiftUpRight(point, sideLength, shiftUpRightCount);
  point = shiftDownLeft(point, sideLength, shiftDownLeftCount);
  point = shiftUpLeft(point, sideLength, shiftUpLeftCount);
  return point;
}

function findCoordinates2(point, sideLength) {
  const x = point.x;
  const y = point.y;
  const s = sideLength;

  if (isLeft(x) && isLeft(y)) {
    return {
      x: Math.sqrt(3) * y * s,
      y: -1 * x * s * 2
    }
  } else if (isRight(x) && isRight(y)) {
    return {
      x: (Math.sqrt(3)/2) * s,
      y: -1 * (1/2) * s * x * 2
    }
  } else if (isRight(x) && isLeft(y)) {
    return {
      x: (Math.sqrt(3)/2) * s,
      y: -1 * (3/2) * s * x
    }
  }

  throw `findCoordinates2 ERROR: ${point.x}, ${point.y}`
}

function findCoordinates2Test() {
  const sideLength = 10;
  const tests = [{
    input: {
      x: 0,
      y: 0
    },
    expected: {
      x: 0,
      y: 0
    }
  }, {
    input: {
      x: 0.5,
      y: 0.5
    },
    expected: {
      x: (Math.sqrt(3)/2) * sideLength,
      y: (1/2) * sideLength
    }
  }, {
    input: {
      x: 0,
      y: 1
    },
    expected: {
      x: Math.sqrt(3) * sideLength,
      y: 0
    }
  }, {
    input: {
      x: -1,
      y: 0
    },
    expected: {
      x: (Math.sqrt(3)/2) * sideLength,
      y: (-3/2) * sideLength
    }
  }, {
    input: {
      x: -0.5,
      y: -0.5
    },
    expected: {
      x: 0,
      y: -sideLength
    }
  }];

  let pass = true;
  for (let test of tests) {
    const result = findCoordinates2(test.input, sideLength);
    let testPass = result.x === test.expected.x && result.y === test.expected.y;
    if (testPass) {
      console.log(`Test passed`);
    } else {
      console.log(`Test failed.\nActual: ${JSON.stringify(result, undefined, 4)}\nExpected: ${JSON.stringify(test.expected, undefined, 4)}`);
    }
    pass = pass && testPass
  }
  console.log(`Tests ${pass ? 'passed' : 'failed'}`);
}

findCoordinates2Test();

function findCoordinates(point, sideLength) {
  if (Number.isInteger(point.x) && Number.isInteger(point.y)) {
    if (point.x % 2 === 0) {
      return {
        x: Math.sqrt(3) * sideLength * point.y,
        y: (3/2) * sideLength * point.x * -1,
      };
    } else {
      const yOneLess = (point.y > 0 ? 1 : -1) * (Math.abs(point.y) - 1);
      return {
        x: (Math.sqrt(3) * sideLength * yOneLess) + ((Math.sqrt(3)/2) * sideLength),
        y: (3/2) * sideLength * point.x * -1,
      }
    }
  } else {
    if (point.x > 0) {
      return {
        x: Math.sqrt(3) * sideLength * point.y,
        y: ((3/2) * sideLength * (point.x - 1)) + ((1/2) * sideLength) * -1,
      };
    } else {
      return {
        x: Math.sqrt(3) * sideLength * point.y,
        y: ((3/2) * sideLength * point.x) * -1,
      };
    }

  }
}
*/

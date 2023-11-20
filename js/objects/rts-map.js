import { drawRect } from '../utility.js';

export const MOUNTAIN = 'M';
export const WOODS = 'W';

const types = {
    [MOUNTAIN]: { w: 3, h: 3, r: 100, g: 100, b: 100, blocking: true },
    [WOODS]:    { w: 2, h: 2, r: 0,   g: 100, b: 0,   blocking: true },
}

export default class RtsMap {
  constructor({
              context,
              cellSize = 20,
              shiftX = 0,
              shiftY = 0,
            } = {}) {
    this.context = context;
    this.cellSize = cellSize;
    this.shiftX = shiftX;
    this.shiftY = shiftY;
    this.regions = [];
    this.spacing = {};
  }

  addRegion(type, x, y) {
    // Find an open space for this region to go.
    let { xFinal, yFinal } = this.findOpenSpace(type, x, y)

    // Save the region for drawing on screen.
    this.regions.push({ type, x: xFinal, y: yFinal });

    // Save the spaces the region takes up for calculating collisions.
    for (var i = 0; i < types[type].w; i++) {
      for (var j = 0; j < types[type].h; j++) {
        this.spacing[`${xFinal + i}-${yFinal + j}`] = this.regions.length;
      }
    }
  }

  draw() {
    this.regions.forEach(region => {
        if (types[region.type].img) {
            console.log('Implement img: ' + region.img);
        } else {
            drawRect({
                context: this.context,
                x: this.cellSize * (region.x + this.shiftX),
                y: this.cellSize * (region.y + this.shiftY),
                w: this.cellSize * types[region.type].w,
                h: this.cellSize * types[region.type].h,
                r: types[region.type].r,
                g: types[region.type].g,
                b: types[region.type].b
            });
        }
    });
  }

  findOpenSpace(type, x, y) {
    let findXRight = 0;
    while (this.spacing[`${x + findXRight}-${y}`] != undefined) {
        findXRight++;
    }
    let findXLeft = 0;
    while (this.spacing[`${x + findXLeft}-${y}`] != undefined) {
        findXLeft--;
    }
    let findX = Math.abs(findXLeft) < Math.abs(findXRight) ? findXLeft - types[type].w + 1 : findXRight;

    let findYBottom = 0;
    while (this.spacing[`${x}-${y + findYBottom}`] != undefined) {
        findYBottom++;
    }
    let findYTop = 0;
    while (this.spacing[`${x}-${y + findYTop}`] != undefined) {
        findYTop--;
    }
    let findY = Math.abs(findYTop) < Math.abs(findXRight) ? findYTop - types[type].h + 1 : findYBottom;

    let findXFinal = Math.abs(findX) < Math.abs(findY) ? findX : 0;
    let findYFinal = Math.abs(findX) < Math.abs(findY) ? 0 : findY;
    let xFinal = x + findXFinal;
    let yFinal = y + findYFinal;

    return { xFinal, yFinal };
  }

  update() {
    this.draw();
  }
}

import { getMousePos } from '/js/utility.js';

export default class CpgMenuIcon extends HTMLElement {
  constructor() {
    super();

    this.shadow = this.attachShadow({mode: 'open'});
    this.shadow.innerHTML = `
      <style media="screen">
        :host {
          cursor: pointer;
        }
      </style>
      <canvas></canvas>
    `;
  }

  connectedCallback() {
    /* Configuration Options */
    this.speed = parseFloat(this.dataset.speed) || 0.2;
    this.lineCount = parseFloat(this.dataset.lineCount) || 3;
    this.lineThickness = parseFloat(this.dataset.lineThickness) || 2;
    this.lineColor = this.dataset.lineColor || 'rgba(0, 0, 0, 1)';
    /* ---------------------- */

    this.canvas = this.shadow.querySelector('canvas');
    this.context = this.canvas.getContext('2d');
    this.mousePosition = {x: 0, y: 0};
    this.width = this.clientWidth;
    this.height = this.clientHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.hovering = false;
    this.targetX = 0;
    this.targetY = this.height / 2;

    this.initialLines = [];
    for (var i = 0; i < this.lineCount; i++ ) {
      this.initialLines.push(this.height * ((i+1)/(this.lineCount+1)));
    }

    this.lines = [];
    this.initialLines.forEach(initialLine => {
      this.lines.push({
        x1: 0,
        y1: initialLine,
        x2: this.width,
        y2: initialLine,
        initial: {
          x1: 0,
          y1: initialLine,
          x2: this.width,
          y2: initialLine
        }
      });
    });

    this.canvas.addEventListener('mousemove', event => {
      this.mousePosition = getMousePos(this.canvas, event);
    }, false);

    this.canvas.addEventListener("mouseenter", event => this.hovering = true);
    this.canvas.addEventListener("mouseleave", event => this.hovering = false);

    var animate;
    animate = () => {
      requestAnimationFrame(animate);
      this.doAnimate();
    }
    animate();
  }

  doAnimate() {
    this.update();
    this.draw();
  }

  update() {
    this.lines.forEach(line => {
      var newPoint;
      if (this.hovering) {
        newPoint = CpgMenuIcon.movePoint(line.x1, line.y1, this.targetX, this.targetY, this.speed);
      } else {
        newPoint = CpgMenuIcon.movePoint(line.x1, line.y1, line.initial.x1, line.initial.y1, this.speed);
      }
      line.x1 = newPoint.x;
      line.y1 = newPoint.y;
    });
  }

  /** @function movePoint
   *  Returns a new point that is directly between point (x1, y1) and (x2, y2)
   *  and has moved the specified percentage between them.
   */
  static movePoint(x1, y1, x2, y2, move) {
    var xDiff = x1 - x2;
    var yDiff = y1 - y2;
    var xMove = -xDiff * move;
    var yMove = -yDiff * move;

    return { x: x1 + xMove, y: y1 + yMove };
  }

  draw() {
    this.context.clearRect(0, 0, this.width, this.height);
    this.lines.forEach(line => this.drawLine(line.x1, line.y1, line.x2, line.y2));
  }

  drawLine(x1, y1, x2, y2) {
    this.context.beginPath();
    this.context.lineWidth = this.lineThickness;
    this.context.strokeStyle = this.lineColor;
    this.context.lineTo(x1, y1);
    this.context.lineTo(x2, y2);
    this.context.stroke();
  }
}

customElements.define('cpg-menu-icon', CpgMenuIcon);

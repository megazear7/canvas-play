import { getMousePos } from '/js/utility.js';

export default class CpgMenuIcon extends HTMLElement {
  constructor() {
    super();
    var shadow = this.attachShadow({mode: 'open'});
    shadow.innerHTML = `
      <style media="screen">
        :host {
          cursor: pointer;
        }

        canvas {
          padding: 0;
          margin: 0;
        }
      </style>
      <canvas></canvas>
    `;

    this.canvas = shadow.querySelector('canvas');
    this.context = this.canvas.getContext('2d');
    this.mousePosition = {x: 0, y: 0};
    this.width = this.clientWidth;
    this.height = this.clientHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.hovering = false;
    this.thickness = 2;

    this.initialLines = [
      this.offsetWidth * (1/8),
      this.offsetWidth * (4/8),
      this.offsetWidth * (7/8)
    ];

    this.lines = [];
    this.initialLines.forEach(initialLine => {
      this.lines.push({
        x1: 0,
        y1: initialLine,
        x2: this.offsetWidth,
        y2: initialLine
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
    if (this.hovering) {
      // move to arrow state
    } else {
      // move back to rest
    }
  }

  draw() {
    this.context.clearRect(0, 0, this.width, this.height);
    this.lines.forEach(line => this.drawLine(line.x1, line.y1, line.x2, line.y2));
  }

  drawLine(x1, y1, x2, y2) {
    this.context.beginPath();
    this.context.lineWidth = this.thickness;
    this.context.strokeStyle = `rgba(0, 0, 0, 1)`;
    this.context.lineTo(x1, y1);
    this.context.lineTo(x2, y2);
    this.context.stroke();
  }
}

customElements.define('cpg-menu-icon', CpgMenuIcon);

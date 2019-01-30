import { getMousePos, movePoint, drawLine } from '../utility.js';

export default class CpgFlexIcon extends HTMLElement {
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
    this.canvas = this.shadow.querySelector('canvas');
    this.context = this.canvas.getContext('2d');
    this.mousePosition = {x: 0, y: 0};
    this.width = this.clientWidth;
    this.height = this.clientHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.hovering = false;

    /* ---------------------- */
    /* Configuration Options */
    /* ---------------------- */

    this.lineThickness = parseFloat(this.dataset.lineThickness) || 2;
    this.lineColor = this.dataset.lineColor || 'rgba(0, 0, 0, 1)';

    /* ---------------------- */
    /* ---------------------- */
    /* ---------------------- */

    this.lines = [];

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
  }

  draw() {
    this.context.clearRect(0, 0, this.width, this.height);
    this.lines.forEach(line => drawLine(
      this.context,
      {x: line.x1, y: line.y1},
      {x: line.x2, y: line.y2},
      this.lineThickness,
      this.lineColor
    ));
  }
}

customElements.define('cpg-flex-icon', CpgFlexIcon);

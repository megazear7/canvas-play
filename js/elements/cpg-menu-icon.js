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
    this.drawLine(this.offsetWidth * (1/8), 2);
    this.drawLine(this.offsetWidth * (4/8), 2);
    this.drawLine(this.offsetWidth * (7/8), 2);
  }

  drawLine(shift, thickness) {
    this.context.beginPath();
    this.context.lineWidth = thickness;
    this.context.strokeStyle = `rgba(0, 0, 0, 1)`;
    this.context.lineTo(0, shift);
    this.context.lineTo(this.offsetWidth, shift);
    this.context.stroke();
  }
}

customElements.define('cpg-menu-icon', CpgMenuIcon);

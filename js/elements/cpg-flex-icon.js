import { getMousePos, movePoint, drawLine } from '../utility.js';
import MovingLine from '../objects/moving-line.js';

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

    this.lineThickness = parseFloat(this.getAttribute('lineThickness')) || 2;
    this.maxLineCount = parseFloat(this.getAttribute('maxLineCount')) || 10;
    this.lineColor = this.getAttribute('lineColor') || 'rgba(0, 0, 0, 1)';
    this.speed = this.getAttribute('speed') || '1';

    this.lines = [];
    for (var i = 0; i < this.maxLineCount; i++) {
      let lineAttr = this.getAttribute('line-' + (i+1))
      if (lineAttr) {
        let points = lineAttr.split(/\s+/).map(stringNumber => parseFloat(stringNumber));
        let line = {
          p1: {
            x: points[0],
            y: points[1]
          },
          p2: {
            x: points[2],
            y: points[3]
          },
          rest: {
            p1: {
              x: points[0],
              y: points[1]
            },
            p2: {
              x: points[2],
              y: points[3]
            }
          }
        };

        line.context = this.context;
        line.contextWidth = this.clientWidth;
        line.contextHeight = this.clientHeight;
        line.speed = this.speed;

        let hoverLineAttr = this.getAttribute('line-' + (i+1) + '-hover');
        if (hoverLineAttr) {
          let points = hoverLineAttr.split(/\s+/);
          line.target = {
            p1: {
              x: points[0],
              y: points[1]
            },
            p2: {
              x: points[2],
              y: points[3]
            }
          }
        }

        this.lines.push(new MovingLine(line));
      }
    }

    /* ---------------------- */
    /* ---------------------- */
    /* ---------------------- */

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
      line.pos.p1,
      line.pos.p2,
      this.lineThickness,
      this.lineColor
    ));
  }
}

customElements.define('cpg-flex-icon', CpgFlexIcon);

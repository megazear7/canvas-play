import { getMousePos, parseLineAttr } from '../utility.js';
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
    this._lineThicknessMod = 2;
    this._defaultLineThickness = 1;

    /* ---------------------- */
    /* Configuration Options */
    /* ---------------------- */
    this.lineThickness = parseFloat(this.getAttribute('line-thickness')) || this._defaultLineThickness;
    this.maxLineCount = parseFloat(this.getAttribute('max-line-count')) || 10;
    this.speed = parseFloat(this.getAttribute('speed')) / 5 || 0.2;
    this.color = this.getAttribute('color') || 'rgba(0, 0, 0, 1)';
    this.lines = this.createLines();
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
    this.lines.forEach(line => line.update(this.hovering));
  }

  draw() {
    this.context.clearRect(0, 0, this.width, this.height);
    this.lines.forEach(line => line.draw());
  }

  createLines() {
    let lines = [];
    for (var i = 0; i < this.maxLineCount; i++) {
      let lineAttr = this.getAttribute('line-' + (i+1))
      if (lineAttr) {
        let line = parseLineAttr(lineAttr, this.lineThickness);
        line.thickness *= this._lineThicknessMod;
        line.rest = parseLineAttr(lineAttr, this._defaultLineThickness);
        line.rest.thickness *= this._lineThicknessMod;
        line.context = this.context;
        line.contextWidth = this.clientWidth;
        line.contextHeight = this.clientHeight;
        line.speed = this.speed;
        line.color = this.color;
        line.speed = this.speed;

        let hoverLineAttr = this.getAttribute('line-' + (i+1) + '-hover');
        if (hoverLineAttr) {
          line.target = parseLineAttr(hoverLineAttr, this.lineThickness);
          line.target.thickness *= this._lineThicknessMod;
        }

        lines.push(new MovingLine(line));
      }
    }
    return lines;
  }
}

customElements.define('cpg-flex-icon', CpgFlexIcon);

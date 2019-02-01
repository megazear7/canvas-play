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
    this._defaultSpeed = 1;
    this._speedMod = 0.2;
    this._defaultColor = 'rgba(0, 0, 0, 1)';
    this._defaultMaxLineCount = 10;
    this._defaultMaxHoverTargets = 4;

    /* ---------------------- */
    /* Configuration Options */
    /* ---------------------- */
    this.lineThickness = parseFloat(this.getAttribute('line-thickness')) || this._defaultLineThickness;
    this.maxLineCount = parseFloat(this.getAttribute('max-line-count')) || this._defaultMaxLineCount;
    this.maxHoverTargets = parseFloat(this.getAttribute('max-hover-targets')) || this._defaultMaxHoverTargets
    this.speed = (parseFloat(this.getAttribute('speed')) * this._defaultSpeed) || this._defaultSpeed;
    this.color = this.getAttribute('color') || this._defaultColor;
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
        let line = parseLineAttr(lineAttr, this.lineThickness, this.speed);
        line.thickness *= this._lineThicknessMod;
        line.rest = parseLineAttr(lineAttr, this._defaultLineThickness, this.speed);
        line.rest.thickness *= this._lineThicknessMod;
        line.rest.speed *= this._speedMod;
        line.context = this.context;
        line.contextWidth = this.clientWidth;
        line.contextHeight = this.clientHeight;
        line.color = this.color;
        line.speed *= this._speedMod;
        line.hoverTargets = [];

        for (var j = 0; j < this.maxHoverTargets; j++) {
          let hoverLineAttr = this.getAttribute(`line-${i+1}-hover-${j+1}`);
          if (hoverLineAttr) {
            var target = parseLineAttr(hoverLineAttr, this.lineThickness, this.speed);
            target.thickness *= this._lineThicknessMod;
            target.speed *= this._speedMod;
            line.hoverTargets.push(target);
          }
        }

        lines.push(new MovingLine(line));
      }
    }
    return lines;
  }
}

customElements.define('cpg-flex-icon', CpgFlexIcon);

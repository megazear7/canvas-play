export default class CpgMenuIcon extends HTMLElement {
  constructor() {
    super();
    var shadow = this.attachShadow({mode: 'open'});
    shadow.innerHTML = `
      <style media="screen">
        canvas {
          background-color: red;
        }
      </style>
      <canvas></canvas>
    `;
    this.canvas = shadow.querySelector('canvas');

    this.canvas.width = 50;
    this.canvas.height = 50;
  }
}

customElements.define('cpg-menu-icon', CpgMenuIcon);

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
    this.context = this.canvas.getContext('2d');
    this.mousePosition = {x: 0, y: 0};

    this.canvas.addEventListener('mousemove', event => {
      this.mousePosition = getMousePos(this.canvas, event);
    }, false);

    var animate;
    animate = () => {
      requestAnimationFrame(animate);
      this.doAnimate();
    }
    animate();
  }

  doAnimate() {
    this.context.clearRect(0, 0, 50, 50);
    this.context.fillRect(0, 0, 30, 30);
  }
}

customElements.define('cpg-menu-icon', CpgMenuIcon);

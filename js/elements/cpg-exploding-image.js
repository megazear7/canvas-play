import { getMousePos } from '/js/utility.js';

export default class CpgExplodingImage extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({mode: 'open'});
    this.shadow.innerHTML = `
      <style>
        :host {
        }

        canvas {
        }
      </style>
      <canvas></canvas>
    `;
  }

  connectedCallback() {
    this.canvas = this.shadow.querySelector('canvas');
    this.context = this.canvas.getContext('2d');
    this.mousePosition = {x: 0, y: 0};

    /* ---------------------- */
    /* Configuration Options */
    /* ---------------------- */
    this.href = this.getAttribute('href');
    /* ---------------------- */

    fetch(this.href)
    .then(response => response.blob())
    .then(blob => {
      var reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        var base64data = reader.result;
        this.png = new Image();
        this.png.src = base64data;
        this.beginScene();
      }
    });

    this.canvas.addEventListener('mousemove', event => {
      this.mousePosition = getMousePos(this.canvas, event);
    }, false);
  }

  beginScene(pngData) {
    this.canvas.width = this.png.width * 3;
    this.canvas.height = this.png.height * 3;
    this.context.drawImage(this.png, 0, 0);

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
    //this.context.clearRect(0, 0, this.width, this.height);
  }
}

customElements.define('cpg-exploding-image', CpgExplodingImage);

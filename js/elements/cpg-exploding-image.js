import { getMousePos, movePoint } from '/js/utility.js';

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
    this.particles = [];

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

    var data = this.context.getImageData(0, 0, this.png.width, this.png.height);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (var y = 0, y2 = data.height; y < y2; y++) {
      for (var x = 0, x2 = data.width; x < x2; x++) {
        var p = y * 4 * data.width + x * 4;
        if (data.data[p + 3] > 129) {
          var particle = {
            x: this.png.width / 2,
            y: this.png.height / 2,
            target: {
              x: x,
              y: y,
            },
            speed: Math.random() * 4 + 2,
            color:
              "rgb(" +
              data.data[p] +
              "," +
              data.data[p + 1] +
              "," +
              data.data[p + 2] +
              ")"
          };
          this.particles.push(particle);
        }
      }
    }

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
    this.particles.forEach(particle => {
      var newPosition = movePoint(particle, particle.target, 0.01);
      particle.x = newPosition.x;
      particle.y = newPosition.y;
    });
  }

  draw() {
    this.context.clearRect(0, 0, this.width, this.height);
    this.particles.forEach(particle => {
      this.context.fillStyle = particle.color;
      this.context.fillRect(particle.x * 3, particle.y * 3, 3, 3);
    });
  }
}

customElements.define('cpg-exploding-image', CpgExplodingImage);

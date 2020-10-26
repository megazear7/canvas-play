export default class StaticImage {
  constructor({
              context,
              png,
              x = (Math.random() * window.innerWidth * 2) - (window.innerWidth / 2),
              y = 0,
              size = 10
            } = {}) {
    this.context = context;
    this.png = png;
    this.x = x;
    this.y = y;
    this.size = size;
  }

  right() {
    return this.x + (this.size / 2);
  }

  left() {
    return this.x - (this.size / 2);
  }

  bottom() {
    return this.y;
  }

  top() {
    return this.y - this.size;
  }

  draw() {
    this.context.drawImage(this.png, this.x, this.y);
  }

  update() {
    this.draw();
  }
}

import { randomX, randomY, randomSpeed, randomColor, drawCircle } from '../utility.js';
import StaticImage from '../objects/static-image.js';

export default class TopCharacter {
  constructor({
              context,
              x = randomX(),
              y = randomY(),
              radius = (Math.random() * 40) + 10,
              imageSwitchRate = 250,
            } = {}) {
    this.context = context;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.imageSwitchRate = imageSwitchRate;
    this.lastImageSwitch = new Date();
    this.imageIndex = 0;
    this.imageArray = this.images().move.up;
    this.image = new StaticImage({ context: this.context, href: this.imageArray[this.imageIndex], x: this.x, y: this.y });
  }

  right() {
    return this.x + this.radius;
  }

  left() {
    return this.x - this.radius;
  }

  bottom() {
    return this.y + this.radius;
  }

  top() {
    return this.y - this.radius;
  }

  draw() {
    if ((new Date() - this.lastImageSwitch) > this.imageSwitchRate) {
      if (this.imageIndex >= (this.imageArray.length - 1)) {
        this.imageIndex = 0;
      } else {
        this.imageIndex += 1;
      }
      this.lastImageSwitch = new Date();
      this.image.loadHref(this.imageArray[this.imageIndex]);
    }

    this.image.draw();
  }

  update() {
    this.draw();
  }

  images() {
    return {
      move: {
        up: [
          "/images/enmerkar/enmerkar-walk-1.png",
          "/images/enmerkar/enmerkar-walk-2.png"
        ]
      }
    }
  }
}

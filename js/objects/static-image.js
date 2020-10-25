export default class StaticImage {
  constructor({
              context,
              href,
              x = (Math.random() * window.innerWidth * 2) - (window.innerWidth / 2),
              y = 0,
              size = 10
            } = {}) {
    this.context = context;
    this.href = href;
    this.x = x;
    this.y = y;
    this.size = size;
    this.ready = false;
    this.loadHref(this.href);
  }

  beginImg() {
      this.ready = true;
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

  // TODO move this fetch into top character, load all needed images ahead of time and then pass the data around instead of hrefs.
  loadHref(href) {
    fetch(href)
    .then(response => response.blob())
    .then(blob => {
      var reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        var base64data = reader.result;
        this.png = new Image();
        this.png.src = base64data;
        this.png.onload = () => this.beginImg();
      }
    })
  }

  draw() {
      if (this.ready) {
        this.context.drawImage(this.png, this.x, this.y);
      }
  }

  update() {
    this.draw();
  }
}

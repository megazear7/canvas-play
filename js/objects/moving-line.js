export default class MovingLine {
  constructor(config) {
    // Context information for transferring from perctages to absolute values
    this._context = config.context;
    this._contextWidth = config.contextWidth;
    this._contextHeight = config.contextHeight;

    // Current position
    this.p1 = config.p1;
    this.p2 = config.p2;

    // Resting position
    this.rest = { };
    this.rest.p1 = config.p1;
    this.rest.p2 = config.p2;

    // On hover target position
    if (config.target) {
      this.target = { };
      this.target.p1 = config.target.p1;
      this.target.p2 = config.target.p2;
    }
  }

  get pos() {
    return {
      p1: {
        x: this._contextWidth * this.p1.x,
        y: this._contextHeight * this.p1.y
      },
      p2: {
        x: this._contextWidth * this.p2.x,
        y: this._contextHeight * this.p2.y
      }
    }
  }

  move() {
  }
}

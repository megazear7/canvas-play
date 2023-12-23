import { randomX, randomY, drawCircle, distanceBetween, randomNumber } from '../utility.js';

export default class NetworkNode {
  constructor({
              context,
              network,
              sprintEquilibriumDistance,
              x = randomX(),
              y = randomY(),
            } = {}) {
    this.context = context;
    this.network = network;
    this.sprintEquilibriumDistance = sprintEquilibriumDistance;
    this.x = x;
    this.y = y;
    this.dx = 0;
    this.dy = 0;
    this.mass = 2000;
    this.updated = Date.now() + Math.random() * 1000;
    this.maxNodes = randomNumber({ min: 1, max: 4 });
  }

  draw() {
    if (!this.destroy) {
      drawCircle({
        context: this.context,
        x: this.x,
        y: this.y,
        radius: 4,
        lineWidth: 1,
        red: 225,
        green: 205,
        blue: 255,
      });
    }
  }

  update(index) {
    const edges = this.network.edges.filter(edge => edge.includes(index));

    if (Date.now() - this.updated > 2000 && edges.length <= this.maxNodes) {
      this.network.addEdge(this, index);
      this.updated = Date.now() + Math.random() * 1000;
    }

    edges.forEach(edge => {
      const other = edge[0] === index ? this.network.nodes[edge[1]] : this.network.nodes[edge[0]];      
      const k = 0.5;
      const m = this.mass;

      var dx1 = this.x - other.x;
      var dy1 = this.y - other.y;
      var a1 = Math.atan2(dy1, dx1);
      const sprintEquilibriumDistanceX = Math.cos(a1) * this.sprintEquilibriumDistance;
      const sprintEquilibriumDistanceY = Math.sin(a1) * this.sprintEquilibriumDistance;

      const x = other.x - this.x + sprintEquilibriumDistanceX;
      const fx = k * x;
      const ax = fx / m;
      this.dx += ax;

      const y = other.y - this.y + sprintEquilibriumDistanceY;
      const fy = k * y;
      const ay = fy / m;
      this.dy += ay;
    });

    this.x += this.dx;
    this.y += this.dy;
  }
}

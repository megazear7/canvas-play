import { drawCircle, percentAdjust, drawLine, shuffle, randomNumber } from '../utility.js';
import NetworkNode from './network-node.js';
export const APPLE = 'apple';
export const ROTTEN_APPLE = 'rotten_apple';

export default class Network {
  constructor({
              context
  } = {}) {
    this.context = context;
    this.nodes = [];
    this.edges = [];
    this.nodeCount = 1;
    this.maxNodes = 20;
    this.edgeCount = 0;
    this.drawCenter = false;
    this.sprintEquilibriumDistance = Math.sqrt(window.innerWidth * window.innerHeight) / 20;

    for (var i = 0; i < this.nodeCount; i++) {
      this.nodes.push(new NetworkNode({
        context: context,
        network: this,
        sprintEquilibriumDistance: this.sprintEquilibriumDistance,
        x: (window.innerWidth / 2),
        y: (window.innerHeight / 2),
      }));
    }

    for (var i = 0; i < this.edgeCount; i++) {
      let index0 = randomNumber({ min: 0, max: this.nodeCount - 1});
      let index1 = randomNumber({ min: 0, max: this.nodeCount - 1});
      while (index1 === index0) {
        index1 = randomNumber({ min: 0, max: this.nodeCount - 1});
      }
      this.edges.push([ index0, index1 ]);
    }
  }

  draw() {
    var c = {x:0, y:0};
    this.nodes.forEach(node => {
      node.draw();
      c.x += node.x;
      c.y += node.y;
    });
    c.x /= this.nodes.length;
    c.y /= this.nodes.length;
    this.edges.forEach(edge => {
      const p1 = this.nodes[edge[0]];
      const p2 = this.nodes[edge[1]];
      drawLine(this.context, p1, p2, 1, 'rgb(225, 205, 255)');
    });
    if (this.drawCenter) {
      drawCircle({
        context: this.context,
        x: c.x,
        y: c.y,
        radius: 4,
        lineWidth: 1,
        red: 255,
        green: 150,
        blue: 150,
      });
    }
  }

  addEdge(parent, index) {
    this.nodes.push(new NetworkNode({
      context: this.context,
      network: this,
      sprintEquilibriumDistance: this.sprintEquilibriumDistance,
      x: parent.x * percentAdjust(0.01),
      y: parent.y * percentAdjust(0.01),
    }));
    const newIndex = this.nodes.length-1;
    this.edges.push([index, newIndex]);
  }

  update() {
    this.nodes.forEach((node, index) => node.update(index));
    this.draw();

    if (this.nodes.length > this.maxNodes) {
      const index = randomNumber({ min: 0, max: this.nodes.length });
      this.nodes[index].destroy = true;
      this.edges = this.edges.filter(edge => !edge.includes(index));
    }
  }
}

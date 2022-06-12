import Ball2 from "./ball2.js";
import { getDistance } from '../utility.js';

const GRAVITY = 100;
const BOUNCYNESS = 1;

export default class GravityBall extends Ball2 {
    constructor(params) {
        super(params);
        super.changeParams(params, true);
        this.changeParams(params, true);
    }

    changeParams({ mass } = {}, initialize = false) {
        super.changeParams(arguments);
        if (initialize) {
            this.mass = typeof mass !== 'undefined' ? mass : 1;
        } else {
            this.mass = typeof mass !== 'undefined' ? mass : this.mass;
        }
    }

    updateDelta(objects) {
        objects.forEach(object => {
            const distance = getDistance(this.x, this.y, object.x, object.y);
            const angle = Math.atan2(object.y - this.y, object.x - this.x);
            const force = (GRAVITY * this.mass * object.mass) / (distance * distance);
            const xForce = Math.cos(angle) * force;
            const yForce = Math.sin(angle) * force;
            const xAcc = xForce / this.mass;
            const yAcc = yForce / this.mass;
            this.dx = this.dx + xAcc;
            this.dy = this.dy + yAcc;
        });
    }

    updateImpact(objects) {
        objects.forEach(object => {
            const nextDistance = getDistance(this.x + this.dx, this.y + this.dy, object.x, object.y);
            if (nextDistance < this.radius + object.radius) {
                const massRatio = object.mass / this.mass;
                this.dx = object.dx * BOUNCYNESS * massRatio;
                this.dy = object.dy * BOUNCYNESS * massRatio;
            }
        });
    }

    update(objects) {
        let xToMove = this.dx;
        let yToMove = this.dy;

        objects.forEach(object => {
            const nextDistance = getDistance(this.x + this.dx, this.y + this.dy, object.x, object.y);
            if (nextDistance < this.radius + object.radius) {
                const distance = getDistance(this.x, this.y, object.x, object.y) - this.radius - object.radius;
                const angle = Math.atan2(object.y - this.y, object.x - this.x);
                xToMove = Math.cos(angle) * distance;
                yToMove = Math.sin(angle) * distance;
            }
        });

        this.x += xToMove;
        this.y += yToMove;
    }
}

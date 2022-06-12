import Ball2 from "./ball2.js";
import { getDistance } from '../utility.js';

const GRAVITY = 100;
const BOUNCYNESS = 0.9;

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

    update(objects) {
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

        objects.forEach(object => {
            const distance = getDistance(this.x, this.y, object.x, object.y);
            if (distance < this.radius + object.radius) {
                console.log("impact");
                this.dx = (object.dx * object.mass * BOUNCYNESS) / this.mass;
                this.dy = (object.dy * object.mass * BOUNCYNESS) / this.mass;
            }
        });

        if (objects.length > 0) {
            this.x = this.x + this.dx;
            this.y = this.y + this.dy;
        }
    }
}

import Ball2 from "./ball2.js";
import { getDistance } from '../utility.js';

const toughness = 1;

export default class GravityBall extends Ball2 {
    constructor(params) {
        super(params);
        super.changeParams(params, true);
        this.changeParams(params, true);
    }

    changeParams({ mass, name } = {}, initialize = false) {
        super.changeParams(arguments);
        if (initialize) {
            this.name = typeof name !== 'undefined' ? name : '';
            this.mass = typeof mass !== 'undefined' ? mass : 1;
        } else {
            this.name = typeof name !== 'undefined' ? name : this.name;
            this.mass = typeof mass !== 'undefined' ? mass : this.mass;
        }
    }

    others(allObjects) {
        return allObjects.filter(otherObj => this.name !== otherObj.name);
    }

    updateDelta(allObjects) {
        const objects = this.others(allObjects);

        objects.forEach(object => {
            const distance = getDistance(this.x, this.y, object.x, object.y);
            const angle = Math.atan2(object.y - this.y, object.x - this.x);
            const force = (this.mass * object.mass) / (distance * distance);
            const xForce = Math.cos(angle) * force;
            const yForce = Math.sin(angle) * force;
            const xAcc = xForce / this.mass;
            const yAcc = yForce / this.mass;
            this.dx = this.dx + xAcc;
            this.dy = this.dy + yAcc;
        });
    }

    updateImpact(allObjects) {
        const objects = this.others(allObjects);

        objects.forEach(object => {
            const nextDistance = getDistance(this.x + this.dx, this.y + this.dy, object.x + object.dx, object.y + object.dy);
            if (nextDistance < this.radius + object.radius) {
                // TODO: collisions are hard :(
                this._nextDx = 0;
                this._nextDy = 0;
                this.speed = Math.sqrt(Math.pow(this.dx, 2) + Math.pow(this.dy, 2));
                if (this.speed > toughness) {
                    console.log("BOOM");
                    this.fillStyle = 'rgba(255, 0, 0, 1)';
                }
            }
        });
    }

    update(allObjects) {
        const objects = this.others(allObjects);

        if (this._nextDx !== undefined) {
            this.dx = this._nextDx;
            this._nextDx = undefined;
        }
        if (this._nextDy !== undefined) {
            this.dy = this._nextDy;
            this._nextDy = undefined;
        }
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

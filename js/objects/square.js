import { drawRect2 } from "../utility.js";

export default class Square {
    constructor(params) {
        this.changeParams(params, true);
    }

    changeParams({ context, x, y, width, height, lineWidth, lineStyle, fillStyle } = {}, initialize = false) {
        if (initialize) {
            this.context = context;
            this.x = typeof x !== 'undefined' ? x : this.context.canvas.width  / 2;
            this.y = typeof y !== 'undefined' ? y : this.context.canvas.height / 2;
            this.width = typeof width !== 'undefined' ? width : 30;
            this.height = typeof height !== 'undefined' ? height : 30;
            this.lineWidth = typeof lineWidth !== 'undefined' ? lineWidth : 1;
            this.lineStyle = typeof lineStyle !== 'undefined' ? lineStyle : 'rgba(0, 0, 0, 1)';
            this.fillStyle = typeof fillStyle !== 'undefined' ? fillStyle : 'rgba(0, 0, 0, 1)';
        } else {
            this.x = typeof x !== 'undefined' ? x : this.x;
            this.y = typeof y !== 'undefined' ? y : this.y;
            this.width = typeof width !== 'undefined' ? width : 30;
            this.height = typeof height !== 'undefined' ? height : 30;
            this.lineWidth = typeof lineWidth !== 'undefined' ? lineWidth : this.lineWidth;
            this.lineStyle = typeof lineStyle !== 'undefined' ? lineStyle : this.lineStyle;
            this.fillStyle = typeof fillStyle !== 'undefined' ? fillStyle : this.fillStyle;
        }
    }

    draw() {
        drawRect2({
            context: this.context,
            center: { x: this.x, y: this.y },
            width: this.width * 10,
            height: this.height * 10,
            fillStyle: 'rgba(0,0,0,1)',
            lineStyle: 'rgba(0,0,0,0)',
            lineWidth: 1,
        });
        this.context.clearRect(
            this.x - this.width / 2,
            this.y - this.height / 2,
            this.width,
            this.height
        )
    }

    update() {
        this.draw();
    }
}

export default class Circle {
    constructor(params) {
        this.changeParams(params, true);
    }

    changeParams({ context, x, y, radius, lineWidth, lineStyle, fillStyle } = {}, initialize = false) {
        if (initialize) {
            this.context = context;
            this.x = typeof x !== 'undefined' ? x : this.context.canvas.width  / 2;
            this.y = typeof y !== 'undefined' ? y : this.context.canvas.height / 2;
            this.radius = typeof radius !== 'undefined' ? radius : 30;
            this.lineWidth = typeof lineWidth !== 'undefined' ? lineWidth : 1;
            this.lineStyle = typeof lineStyle !== 'undefined' ? lineStyle : 'rgba(0, 0, 0, 1)';
            this.fillStyle = typeof fillStyle !== 'undefined' ? fillStyle : 'rgba(0, 0, 0, 1)';
        } else {
            this.x = typeof x !== 'undefined' ? x : this.x;
            this.y = typeof y !== 'undefined' ? y : this.y;
            this.radius = typeof radius !== 'undefined' ? radius : this.radius;
            this.lineWidth = typeof lineWidth !== 'undefined' ? lineWidth : this.lineWidth;
            this.lineStyle = typeof lineStyle !== 'undefined' ? lineStyle : this.lineStyle;
            this.fillStyle = typeof fillStyle !== 'undefined' ? fillStyle : this.fillStyle;
        }
    }

    draw() {
        this.context.beginPath();
        this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.context.lineWidth = this.lineWidth;
        this.context.strokeStyle = this.lineStyle;
        this.context.stroke();
        this.context.fillStyle = this.fillStyle;
        this.context.fill();
    }
}

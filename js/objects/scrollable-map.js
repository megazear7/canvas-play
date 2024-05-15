import { drawRect2, drawLine } from "../utility.js";
import Square from "../objects/square.js";

const MAX_OVERSCROLL = 100;

export default class Circle {
    constructor(params) {
        this.changeParams(params, true);
    }

    changeParams({ context, canvas, width, height } = {}) {
        this.context = context;
        this.canvas = canvas;
        this.width = width;
        this.height = height;
        this.zoomFactor = 1;
        this.factoredWidth = this.canvas.width;
        this.factoredHeight = this.canvas.height;

        this.posOfContextRelativeToMap = {
            x: (this.width / 2) - (this.canvas.width / 2),
            y: (this.height / 2) - (this.canvas.height / 2),
        }
        this.objects = [];
        this.mapObjects = [];

        this.objects.push(new Square({
            context: this.context,
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            width: this.width,
            height: this.height,
        }))
    }

    draw() {
        this.objects.forEach(obj => obj.draw());
        const crossHairSize = 10;
        drawLine(this.context, { x: (this.canvas.width / 2) - crossHairSize, y: (this.canvas.height / 2) - crossHairSize }, { x: (this.canvas.width / 2) + crossHairSize, y: (this.canvas.height / 2) + crossHairSize });
        drawLine(this.context, { x: (this.canvas.width / 2) + crossHairSize, y: (this.canvas.height / 2) - crossHairSize }, { x: (this.canvas.width / 2) - crossHairSize, y: (this.canvas.height / 2) + crossHairSize });
    }

    update() {
        this.objects.forEach(obj => obj.update());
    }

    scrollUp(distance) {
        console.log(this.posOfContextRelativeToMap);
        const newY = this.posOfContextRelativeToMap.y - distance;
        if (newY > MAX_OVERSCROLL * -1 && newY < this.height + MAX_OVERSCROLL - this.factoredHeight) {
            this.objects.forEach(obj => obj.y += distance);
            this.posOfContextRelativeToMap.y = newY;
        }
    }

    scrollLeft(distance) {
        console.log(this.posOfContextRelativeToMap);
        const newX = this.posOfContextRelativeToMap.x - distance;
        if (newX > MAX_OVERSCROLL * -1 && newX < this.width + MAX_OVERSCROLL - this.factoredWidth) {
            this.objects.forEach(obj => obj.x += distance);
            this.posOfContextRelativeToMap.x = newX;
        }
    }

    /*
     * Convert a point to be relative to the screen that
     * is currently relative to the map
     */
    mapToContext(p) {
        return {
            x: p.x - this.posOfContextRelativeToMap.x,
            y: p.y - this.posOfContextRelativeToMap.y,
        };
    }

    zoom(factor) {
        console.log(this.posOfContextRelativeToMap);
        const newFactor = this.zoomFactor * factor;
        const inverseFactor = 1 - factor + 1;
        const newFactoredWidth = this.factoredWidth * inverseFactor;
        const newFactoredHeight = this.factoredHeight * inverseFactor;
        if (newFactoredWidth < this.width && newFactoredHeight < this.height) {
            this.zoomFactor = newFactor;
            this.factoredWidth = newFactoredWidth;
            this.factoredHeight = newFactoredHeight;
            this.objects.forEach(obj => {
                if (obj.radius) obj.radius *= factor;
                if (obj.width) obj.width *= factor;
                if (obj.height) obj.height *= factor;
                obj.x = ((obj.x - (this.canvas.width / 2)) * factor) + (this.canvas.width / 2);
                obj.y = ((obj.y - (this.canvas.height / 2)) * factor) + (this.canvas.height / 2);
            });
            this.posOfContextRelativeToMap.x = ((this.posOfContextRelativeToMap.x - (this.canvas.width / 2)) * inverseFactor) + (this.canvas.width / 2);
            this.posOfContextRelativeToMap.y = ((this.posOfContextRelativeToMap.y - (this.canvas.height / 2)) * inverseFactor) + (this.canvas.height / 2);
        }
    }
}

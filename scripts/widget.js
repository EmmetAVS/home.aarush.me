let clientX;
let clientY;

document.onmousemove = (e) => {
    clientX = e.clientX;
    clientY = e.clientY;
}

class Widget {
    static distanceFromBorderToResize = 15;
    static allWidgets = [];
    static minSize = 100;

    static saveWidgets() {
        const widgetData = [];
        
        for (const widget of Widget.allWidgets) {
            widgetData.push(widget.toJSON());
        }
        
        localStorage.setItem("widgets", JSON.stringify(widgetData));
    }

    static loadWidgets() {
        const widgetData = localStorage.getItem("widgets");
        if (widgetData) {
            try {
                const widgets = JSON.parse(widgetData);
                console.log('Loading widgets:', widgets);
                for (const widgetJSON of widgets) {
                    const widget = new Widget();
                    widget.fromJSON(widgetJSON);
                    document.body.appendChild(widget.element);
                }

                Widget.saveWidgets();
                return true;
            } catch (error) {
                console.error('Error loading widgets:', error);
                return false;
            }
        } else {
            return false;
        }
    }

    static closeWidget(id) {
        const index = Widget.allWidgets.findIndex(widget => widget.element.id === id);
        const widget = Widget.allWidgets[index];
        if (widget) {
            console.log(`Closing widget: ${widget.element.id}`);
            document.body.removeChild(widget.element);
            Widget.allWidgets.splice(index, 1);
            Widget.saveWidgets();
        }
    }

    static _createHeader(id) {
        return `
            <div class="widget-header" id="${id + "-header"}">
                <button class="widget-settings-button" id="${id + "-settings"}">⚙</button>
                <div class="widget-title" id="${id + "-title"}">Widget</div>
                <button class="widget-close-button" id="${id + "-close"}" onclick="closeWidget('${id}')">X</button>
            </div>
        `
    }

    constructor() {
        this._element = document.createElement('div');
        this._element.id = "widget-" + (new Date()).getTime();
        this._element.style.position = "absolute";

        this._element.innerHTML = `
            ${Widget._createHeader(this._element.id)}
            <div class="widget-content" id="${this._element.id + "-content"}"></div>
        
        `

        this._element.classList.add("widget");
        this._element.addEventListener('mousedown', (event) => { this.mouseDownEvent(event) });
        this._element.addEventListener('mouseup', (event) => { this.mouseUpEvent(event) });
        
        this._resizeInterval = null;
        this._mouseUpListener = null;
        this._moveInterval = null;

        Widget.allWidgets.push(this);

        Widget.saveWidgets();
    }

    mouseDownEvent(event) {

        const rect = this._element.getBoundingClientRect();

        this._originalClientX = event.clientX;
        this._originalElementX = rect.left;
        this._originalClientY = event.clientY;
        this._originalElementY = rect.top;
        this._originalWidth = rect.width;
        this._originalHeight = rect.height;
        
        const rightEdgeResize = rect.right - event.clientX <= Widget.distanceFromBorderToResize;
        const bottomEdgeResize = rect.bottom - event.clientY <= Widget.distanceFromBorderToResize

        if (rightEdgeResize || bottomEdgeResize) {
            if (rightEdgeResize && bottomEdgeResize) {
                this._element.style.cursor = "se-resize";
            } else if (rightEdgeResize) {
                this._element.style.cursor = "e-resize";
            } else if (bottomEdgeResize) {
                this._element.style.cursor = "s-resize";
            }
            document.body.addEventListener('mouseup', (event) => { this.mouseUpEvent(event) });
            this._resizeInterval = setInterval(() => this.resizeWidget(), 10);
            this._isResizing = true;
            return;
        }

        this._offsetX = event.clientX - rect.left;
        this._offsetY = event.clientY - rect.top;

        document.body.addEventListener('mouseup', (event) => { this.mouseUpEvent(event) });
        this._moveInterval = setInterval(() => this.moveWidget(), 10);
        this._isMoving = true;
    }

    moveWidget() {

        let newXPos = clientX - this._offsetX;
        let newYPos = clientY - this._offsetY;
        const rect = this._element.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        newXPos = Math.max(0, newXPos);
        newYPos = Math.max(0, newYPos);
        newXPos = Math.min(window.innerWidth - width, newXPos);
        newYPos = Math.min(window.innerHeight - height, newYPos);

        this._element.style.left = (newXPos) + "px";
        this._element.style.top = (newYPos) + "px";
    }

    resizeWidget() {
       
        let newWidth = this._originalWidth + (clientX - this._originalClientX);
        let newHeight = this._originalHeight + (clientY - this._originalClientY);

        newWidth = Math.max(Widget.minSize, newWidth);
        newHeight = Math.max(Widget.minSize, newHeight);

        if (this._element.style.cursor === "e-resize") {
            this._element.style.width = newWidth + "px";
        } else if (this._element.style.cursor === "s-resize") {
            this._element.style.height = newHeight + "px";
        } else if (this._element.style.cursor === "se-resize") {
            this._element.style.width = newWidth + "px";
            this._element.style.height = newHeight + "px";
        }

        this._element.style.left = (this._originalElementX) + "px";
        this._element.style.top = (this._originalElementY) + "px";

    }

    mouseUpEvent(event) {

        clearInterval(this._moveInterval);
        clearInterval(this._resizeInterval);

        this._isMoving = false;
        this._isResizing = false;

        this._element.style.cursor = "grab";
        document.body.removeEventListener('mouseup', this._mouseUpListener)

        Widget.saveWidgets();
    }

    toJSON() {
        const rect = this._element.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(this._element);
        
        return {
            html: this._element.innerHTML,
            left: this._element.style.left || computedStyle.left,
            top: this._element.style.top || computedStyle.top,
            width: this._element.style.width || computedStyle.width,
            height: this._element.style.height || computedStyle.height,
            id: this._element.id
        };
    }

    fromJSON(data) {
        this._element.innerHTML = data.html || "New Widget!";
        this._element.style.left = data.left || "0px";
        this._element.style.top = data.top || "0px";
        this._element.style.width = data.width || "10rem";
        this._element.style.height = data.height || "5rem";
        this._element.style.position = "absolute";
        this._element.id = data.id || "widget-" + (new Date()).getTime();
    }

    get element() {
        return this._element;
    }

    toString() {
        return JSON.stringify(this.toJSON());
    }
}

export default Widget;
let clientX;
let clientY;

let allWidgetContents = [];

document.onmousemove = (e) => {
    clientX = e.clientX;
    clientY = e.clientY;
}

function animateOpenModal(m) {
  m.style.display = ""
  m.style.opacity = "1"
  m.style.background = "rgba(0, 0, 0, 0.8)"
  m.style.animation = "fade-in 0.3s"
  m.children[0].style.animation = "move-up 0.3s"
}

function animateCloseModal(m) {
  setTimeout(function() {
    m.style.display = "none"
  }, 301)
  m.children[0].style.animation = "move-down 0.3s"
  m.style.animation = "fade-out 0.3s"
  m.style.opacity = 0
}

function handleWidgetModalStartup() {
    const input = document.getElementById("widgetTitle");
    input.addEventListener("keypress", function(event) {

        if (event.key === "Enter") {
            event.preventDefault();
            const widget = Widget.currentUpdatingWidget;
            if (widget) {
                widget.setTitle(input.value);
                document.activeElement.blur();
            }
        }
    });

    const widgetContentOptions = document.getElementById("widgetContentOptions");
    widgetContentOptions.innerHTML = "";

    for (let i = 0; i < allWidgetContents.length; i++) {
        const contentClass = allWidgetContents[i];
        const content = new contentClass(null);
        const element = document.createElement("div");
        element.className = "modal-widget-content-option";
        element.innerHTML = content.toString();
        element.onclick = () => {
            Widget.currentUpdatingWidget.setContent(contentClass);
            animateCloseModal(document.getElementById("modal"));
        }
        widgetContentOptions.appendChild(element);

    }
}

function hexToRgba(hex, alpha) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
        hex = hex.split('').map(x => x + x).join('');
    }
    const num = parseInt(hex, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r},${g},${b},${alpha})`;
}

function rgbToHex(rgb) {
    const result = rgb.match(/\d+/g);
    if (!result) return "#000000";
    return (
        "#" +
        ((1 << 24) + (parseInt(result[0]) << 16) + (parseInt(result[1]) << 8) + parseInt(result[2]))
            .toString(16)
            .slice(1)
    );
}

class Widget {
    static currentUpdatingWidget = null;
    static distanceFromBorderToResize = 15;
    static allWidgets = [];
    static minSize = 100;
    static highestZIndex = 1000;
    static headerVisible = true;

    static updateColors() {
        console.log("Updating widget colors");
        const widget = Widget.currentUpdatingWidget;
        if (!widget) return;

        console.log("Updating widget colors");

        widget.element.style.color = hexToRgba(document.getElementById("widgetColor").value, 1);
        widget.element.style.backgroundColor = hexToRgba(document.getElementById("backgroundColor").value, 0.05);
        widget.element.style.borderColor = hexToRgba(document.getElementById("widgetBorderColor").value, 0.15);
        widget.element.style.setProperty('--widget-border-hover-color', hexToRgba(document.getElementById("widgetBorderColor").value, 0.3));
        const input = document.getElementById("widgetTitle");
        input.style.color = widget.element.style.color || "white";
    }

    static updateWidgetHeaderVisibility() {

        Widget.headerVisible = !Widget.headerVisible;

        if (Widget.headerVisible) document.getElementById("widgetHeaderVisibility").innerHTML = `<img src="./assets/visibility-off.png" alt="Show">`;
        else document.getElementById("widgetHeaderVisibility").innerHTML = `<img src="./assets/visibility-on.png" alt="Hide">`;

        for (const widget of Widget.allWidgets) {
            const header = document.getElementById(widget.element.id + "-header");
            if (!header) continue;

            if (Widget.headerVisible) {
                header.style.display = "flex";

                const rect = widget.element.getBoundingClientRect();
                const oldTop = rect.top;

                widget.element.style.height = rect.height + widget.headerHeight + "px";
                widget.element.style.top = oldTop + "px";
            } else {
                const headerRect = header.getBoundingClientRect();
                const rect = widget.element.getBoundingClientRect();
                widget.headerHeight = headerRect.height;

                const oldTop = rect.top;
                widget.element.style.height = (rect.height - headerRect.height) + "px";
                widget.element.style.top = oldTop + "px";
                header.style.display = "none";
            }
        }

        Widget.saveWidgets();

    }

    static applyHeaderVisibility() {

        if (Widget.headerVisible) document.getElementById("widgetHeaderVisibility").innerHTML = `<img src="./assets/visibility-off.png" alt="Show">`;
        else document.getElementById("widgetHeaderVisibility").innerHTML = `<img src="./assets/visibility-on.png" alt="Hide">`;

        for (const widget of Widget.allWidgets) {
            const header = document.getElementById(widget.element.id + "-header");
            if (!header) continue;

            const rect = widget.element.getBoundingClientRect();
            const oldTop = rect.top;

            if (Widget.headerVisible) {
                header.style.display = "flex";
                widget.element.style.height = (rect.height + widget.headerHeight) + "px";
                widget.element.style.top = oldTop + "px";
            } else {
                widget.headerHeight = header.getBoundingClientRect().height;
                widget.element.style.height = (rect.height - widget.headerHeight) + "px";
                widget.element.style.top = oldTop + "px";
                header.style.display = "none";
            }
        }
    }

    static saveWidgets() {
        const widgetData = [];

        let smallestZIndex = Widget.highestZIndex;
        for (const widget of Widget.allWidgets) {
            if (parseInt(widget.element.style.zIndex, 10) < smallestZIndex) {
                smallestZIndex = parseInt(widget.element.style.zIndex, 10);
            }
        }
        
        for (const widget of Widget.allWidgets) {
            widget.element.style.zIndex = Math.max(parseInt(widget.element.style.zIndex, 10) - smallestZIndex + 1, 0);
            widgetData.push(widget.toJSON());
        }
        
        localStorage.setItem("widgets", JSON.stringify(widgetData));
        localStorage.setItem("widgetHeaderVisible", JSON.stringify(Widget.headerVisible));
    }

    static _startup() {

        handleWidgetModalStartup();

    }

    static loadWidgets() {
        Widget._startup();
        const widgetData = localStorage.getItem("widgets");
        Widget.headerVisible = (localStorage.getItem("widgetHeaderVisible") === "true");
        if (widgetData) {
            try {
                const widgets = JSON.parse(widgetData);
                console.log('Loading widgets:', widgets);
                for (const widgetJSON of widgets) {
                    const widget = new Widget();
                    document.body.appendChild(widget.element);
                    widget.fromJSON(widgetJSON);

                    if (parseInt(widget.element.style.zIndex, 10) > Widget.highestZIndex) {
                        Widget.highestZIndex = parseInt(widget.element.style.zIndex, 10) + 1;
                    }

                    document.getElementById(widget.element.id + "-header").style.display = "flex";
                    const rect = widget.element.getBoundingClientRect();
                    const oldTop = rect.top;

                    if (Widget.headerVisible) widget.headerHeight = 0;
                    else widget.headerHeight = document.getElementById(widget.element.id + "-header").getBoundingClientRect().height;
                    widget.element.style.height = (rect.height + widget.headerHeight) + "px";
                    widget.element.style.top = oldTop + "px";
                }

                Widget.applyHeaderVisibility();
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
            widget.handleClose();
            document.body.removeChild(widget.element);
            Widget.allWidgets.splice(index, 1);
            Widget.saveWidgets();
        }
    }

    static openWidgetSettings(id) {
        const widget = Widget.allWidgets.find(widget => widget.element.id === id);
        Widget.currentUpdatingWidget = widget;
        if (widget) {
            console.log(`Opening settings for widget: ${widget.element.id}`);
            animateOpenModal(document.getElementById("modal"));
        }

        const input = document.getElementById("widgetTitle");
        input.style.color = widget.element.style.color || "white";
        if (input) {
            input.value = widget ? widget.element.querySelector('.widget-title').innerText : '';
        }

        const computed = window.getComputedStyle(widget.element);
        document.getElementById("widgetColor").value = rgbToHex(computed.color);
        document.getElementById("backgroundColor").value = rgbToHex(computed.backgroundColor);
        document.getElementById("widgetBorderColor").value = rgbToHex(computed.borderColor);

        const customOptions = document.getElementById("widgetCustomOptions");
        customOptions.innerHTML = "";
        if (widget.contentClassInstance) 
            customOptions.appendChild(widget.contentClassInstance.customOptions());
    }

    static modalClose(action) {
        const modal = document.getElementById("modal");
        if (modal) {
            animateCloseModal(modal);
        }
    }

    static _createHeader(id) {
        return `
            <div class="widget-header" id="${id + "-header"}">
                <button class="widget-header-button" id="${id + "-settings"}" onclick="openWidgetSettings('${id}')">⚙</button>
                <div class="widget-title" id="${id + "-title"}">Widget</div>
                <button class="widget-header-button" id="${id + "-close"}" onclick="closeWidget('${id}')">X</button>
            </div>
        `
    }

    constructor() {
        this._element = document.createElement('div');
        this._element.id = "widget-" + (new Date()).getTime();
        this._element.style.position = "absolute";
        this._element.style.zIndex = Widget.highestZIndex++;

        this._element.style.width = Widget.minSize * 1.5 + "px";
        this._element.style.height = Widget.minSize + "px";

        this._element.style.left = "0px";
        this._element.style.top = "0px";

        this._element.innerHTML = `
            ${Widget._createHeader(this._element.id)}
            <div class="widget-content" id="${this._element.id + "-content"}"></div>
        
        `

        this.headerHeight = 0;

        this._element.classList.add("widget");
        this._element.addEventListener('mousedown', (event) => { this.mouseDownEvent(event) });
        this._element.addEventListener('mouseup', (event) => { this.mouseUpEvent(event) });
        
        this._resizeInterval = null;
        this._mouseUpListener = null;
        this._moveInterval = null;

        this.data = {};

        Widget.allWidgets.push(this);

        Widget.saveWidgets();
    }

    handleClose() {
        if (this._resizeInterval) {
            clearInterval(this._resizeInterval);
        }
        if (this._moveInterval) {
            clearInterval(this._moveInterval);
        }
        this._element.removeEventListener('mousedown', this.mouseDownEvent);
        this._element.removeEventListener('mouseup', this.mouseUpEvent);
    }

    mouseDownEvent(event) {

        if (parseInt(this._element.style.zIndex, 10) < Widget.highestZIndex) {
            this._element.style.zIndex = Widget.highestZIndex++;
        }

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
        newHeight = Math.max((Widget.minSize * 0.3), newHeight);

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
            id: this._element.id,
            zIndex: this._element.style.zIndex,
            contentClassName: this.contentClassName,
            widgetColor: this._element.style.color,
            backgroundColor: this._element.style.backgroundColor,
            widgetBorderColor: this._element.style.borderColor,
            data: this.data || {},
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
        this._element.style.zIndex = data.zIndex || Widget.highestZIndex++;
        this._element.style.color = data.widgetColor || "#ffffff";
        this._element.style.backgroundColor = data.backgroundColor || hexToRgba("#000000", 0.05);
        this._element.style.borderColor = data.widgetBorderColor || hexToRgba("#000000", 0.15);
        this._element.style.setProperty('--widget-border-hover-color', data.widgetBorderColor || hexToRgba("#000000", 0.3));
        this.data = data.data || {};
        if (data.contentClassName) {
            const contentClass = allWidgetContents.find(c => c.name == data.contentClassName);
            if (!contentClass) {
                console.warn(`Content class not found: ${data.contentClassName}`);
            } else {
                this.setContent(contentClass);
            }
        }
    }

    get element() {
        return this._element;
    }

    get id() {
        return this._element.id;
    }

    toString() {
        return JSON.stringify(this.toJSON());
    }

    setTitle(title) {
        const titleElement = document.getElementById(this._element.id + "-title");
        if (titleElement) {
            titleElement.innerText = title;
        } else {
            console.warn(`Title element not found for widget with ID: ${this._element.id}`);
        }

        Widget.saveWidgets();
    }

    setContent(contentClass) {
        this.contentClassName = contentClass.name;
        const contentElement = document.getElementById(this._element.id + "-content");
        this.contentClassInstance = new contentClass(this._element.id);
        if (contentElement) {
            contentElement.innerHTML = this.contentClassInstance.toString();
        } else {
            console.log(this._element.innerHTML);
            console.warn(`Content element not found for widget with ID: ${this._element.id}`);
        }

        Widget.saveWidgets();
    }

    getContent() {
        return document.getElementById(this._element.id + "-content");
    }

}

class WidgetContent {
    constructor(widgetId, interval = 1000) {
        this._widgetId = widgetId;

        if (!this._update || !widgetId) return;
        this._update();
        this._interval = setInterval(() => {
            const widget = Widget.allWidgets.find(widget => widget.element.id === this._widgetId);
            if (!widget) {
                clearInterval(this._interval);
                return;
            }
            if (this._update() === false) {
                clearInterval(this._interval);
                return;
            }
        }, interval);
    }

    customOptions() {
        const options = document.createElement("div");
        options.style.display = "none";
        return options;
    }
}

export default Widget;
export { Widget, WidgetContent, allWidgetContents };
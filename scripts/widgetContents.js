import {Widget, WidgetContent, allWidgetContents} from "./widget.js"

class ClockWidgetContent extends WidgetContent {

    constructor(widgetId) {
        super(widgetId);
        this._content = "Clock Widget Content";
    }

    _update() {
        const contentElement = document.getElementById(this._widgetId + "-content");
        if (contentElement) {
            contentElement.innerHTML = this.toString();
        }
    }

    toString() {
        return `<div style="width: 100%; height: 100%;">${new Date().toLocaleTimeString()}</div>`;
    }
}

class CalendarWidgetContent extends WidgetContent {
    constructor(widgetId) {
        super(widgetId);
        this._content = "Calendar Widget Content";
    }

    toString() {
        return `<div style="background-color: black; width: 100%; height: 100%;">${Math.random()}</div>`
    }
}

allWidgetContents.push(CalendarWidgetContent);
allWidgetContents.push(ClockWidgetContent);
allWidgetContents.push(CalendarWidgetContent);
allWidgetContents.push(CalendarWidgetContent);
allWidgetContents.push(CalendarWidgetContent);
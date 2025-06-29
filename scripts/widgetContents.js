import {Widget, WidgetContent, allWidgetContents} from "./widget.js"

class ClockWidgetContent extends WidgetContent {

    static style = `
    
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    
    `

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

        const Weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const now = new Date()
        const hours = JSON.stringify(now.getHours()).padStart(2, '0')
        const seconds = JSON.stringify(now.getSeconds()).padStart(2, '0')
        const minutes = JSON.stringify(now.getMinutes()).padStart(2, '0')
        const DatetimeText = `${Weekdays[now.getDay()]} ${now.getMonth()+1}/${now.getDate()}/${now.getFullYear()}, ${hours}:${minutes}:${seconds}`

        return `<div style="${ClockWidgetContent.style}">${DatetimeText}</div>`;
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

class SearchBarWidgetContent extends WidgetContent {

    static style = `
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    `

    static inputStyle = `
        width: 100%;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
        padding-top: 0.25rem;
        padding-bottom: 0.25rem;
        background-color: rgba(255, 255, 255, 0.2);
        color: inherit;
        border-color: rgba(0, 0, 0, 0.2);
        border-style: solid;
        border-radius: var(--radius);
        box-sizing: border-box;
    `

    constructor(widgetId) {
        super(widgetId);
        this._content = "Search Bar Widget Content";

        this._input = document.createElement("input");
        this._input.type = "text";
        this._input.id = widgetId + "-search-input";
        this._input.style = SearchBarWidgetContent.inputStyle;
        if (document.getElementById(widgetId)) {
            this._input.style.color = document.getElementById(widgetId).style.color || "white";
        } else {
            this._input.style.color = "white";
        }
        this._input.placeholder = "Search...";
    }

    toString() {
        return `<div style="${SearchBarWidgetContent.style}">${this._input.outerHTML}</div>`
    }

    _update() {
        const input = document.getElementById(this._widgetId + "-search-input");
        if (input) {
            input.addEventListener("keydown", (event) => this.inputEventListener(event));
            this._input = input;
            return false;
        }
        return true;
    }

    inputEventListener(event) {
        console.log(event);
        if (event.key == "Enter") {
            const inputValue = this._input.value;
            if (inputValue.trim() === "") return;
            const website = `https://www.google.com/search?q=${inputValue}`;
            this._input.value = "";
            document.activeElement.blur();
            window.open(website);
        }
    }
}

allWidgetContents.push(CalendarWidgetContent);
allWidgetContents.push(ClockWidgetContent);
allWidgetContents.push(SearchBarWidgetContent);
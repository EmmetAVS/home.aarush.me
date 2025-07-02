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
        this._fontSize = "1.5rem";
        const widget = Widget.allWidgets.find(w => w.id === widgetId);
        if (widget && widget.data && widget.data.fontSize) {
            this._fontSize = widget.data.fontSize;
        }

        if (widget) {
            widget.data["fontSize"] = this._fontSize;
        }
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
        const hours = JSON.stringify(now.getHours() % 12).padStart(2, '0')
        const seconds = JSON.stringify(now.getSeconds()).padStart(2, '0')
        const minutes = JSON.stringify(now.getMinutes()).padStart(2, '0')
        const DatetimeText = `${Weekdays[now.getDay()]} ${now.getMonth()+1}/${now.getDate()}/${now.getFullYear()}, ${hours}:${minutes}:${seconds}`

        return `<div style="${ClockWidgetContent.style};font-size: ${this._fontSize}">${DatetimeText}</div>`;
    }

    customOptions() {
        
        const options = document.createElement("div");
        options.style.display = "flex";
        options.style.flexDirection = "row";
        options.style.alignItems = "center";
        options.style.width = "auto";
        options.style.gap = "1rem";

        const fontSizeLabel = document.createElement("label");
        fontSizeLabel.innerText = "Font Size:";
        const fontSizeInput = document.createElement("input");
        fontSizeInput.type = "number";
        fontSizeInput.value = this._fontSize.replace("rem", "");
        fontSizeInput.style.width = "4rem";
        fontSizeInput.style.padding = "0.25rem";
        fontSizeInput.onchange = () => {
            const newSize = fontSizeInput.value + "rem";
            const contentElement = document.getElementById(this._widgetId + "-content");
            if (contentElement) {
                contentElement.style.fontSize = newSize;
                console.log("Font size changed to:", newSize);
                this._fontSize = newSize;
            }
            const widget = Widget.allWidgets.find(w => w.id === this._widgetId);
            if (widget) {
                widget.data["fontSize"] = newSize;
                Widget.saveWidgets();
            }
        }

        options.appendChild(fontSizeLabel);
        options.appendChild(fontSizeInput);

        return options;
    }
}

class SearchBarWidgetContent extends WidgetContent {

    static possibleSearchEngines = [
        {name: "Google", url: "https://www.google.com/search?q="},
        {name: "Bing", url: "https://www.bing.com/search?q="},
        {name: "DuckDuckGo", url: "https://duckduckgo.com/?q="},
        {name: "Yahoo", url: "https://search.yahoo.com/search?p="},
        {name: "Ecosia", url: "https://www.ecosia.org/search?q="}
    ]

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

        const widget = Widget.allWidgets.find(w => w.id === widgetId);
        let activeEngine;
        if (widget && widget.data && widget.data.activeSearchEngine) {
            activeEngine = SearchBarWidgetContent.possibleSearchEngines.find(engine => engine.name === widget.data.activeSearchEngine);
            widget.data["activeSearchEngine"] = activeEngine.name;
        } else {
            activeEngine = SearchBarWidgetContent.possibleSearchEngines[0];
            if (widget) {
                widget.data["activeSearchEngine"] = activeEngine.name;
            }
        }
        this._activeEngineLink = activeEngine.url;

        this._input = document.createElement("input");
        this._input.type = "text";
        this._input.id = widgetId + "-search-input";
        this._input.style = SearchBarWidgetContent.inputStyle;
        if (document.getElementById(widgetId)) {
            this._input.style.color = document.getElementById(widgetId).style.color || "white";
        } else {
            this._input.style.color = "white";
        }
        if (widget) {
            this._input.placeholder = `Search with ${widget.data["activeSearchEngine"]}...`;
        }
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
            const website = `${this._activeEngineLink}${inputValue}`;
            this._input.value = "";
            document.activeElement.blur();
            window.open(website);
        }
    }

    customOptions() {
        const options = document.createElement("div");
        options.style.display = "flex";
        options.style.flexDirection = "row";
        options.style.justifyContent = "space-between";
        options.style.alignItems = "center";
        options.style.width = "90%";

        for (const engine of SearchBarWidgetContent.possibleSearchEngines) {
            const button = document.createElement("button");
            button.style.margin = "0";
            button.style.width = "8rem";
            button.style.padding = "0.25rem 0.5rem";
            button.innerText = engine.name;
            button.onclick = () => {
                this._input.value = "";
                document.activeElement.blur();
                this._activeEngineLink = engine.url;
                this._input.placeholder = `Search with ${engine.name}...`;
                const widget = Widget.allWidgets.find(w => w.id === this._widgetId);
                if (widget) {
                    widget.data["activeSearchEngine"] = engine.name;
                    Widget.saveWidgets();
                }
            };
            options.appendChild(button);
        }

        return options;
    }
}

class BookmarkBarWidgetContent extends WidgetContent {
    static style = `
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0.5rem 0;
    `;

    static innerStyle = `
        width: 100%;
        max-height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        overflow-y: auto;
        overflow-x: hidden;
        scrollbar-width: none;
        -ms-overflow-style: none;
    `;

    constructor(widgetId) {
        super(widgetId);
        this.bookmarks = [];
        if (widgetId) {
            const widget = Widget.allWidgets.find(w => w.id === widgetId);
            if (widget) {
                if (!widget.data.bookmarks) {
                    widget.data.bookmarks = [];
                }
                this.bookmarks = widget.data.bookmarks;
            }
        }
    }

    toString() {
        
        if (this._widgetId == null) {
            this.bookmarks = [
                {name: "Example Bookmark", url: "https://example.com"},
                {name: "Another Bookmark", url: "https://another-example.com"}
            ]
        }

        const bookmarks = this.bookmarks || [];
        return `<div style="${BookmarkBarWidgetContent.style}">
            <div class="hidden-scrollbar" style="${BookmarkBarWidgetContent.innerStyle}">
                ${bookmarks.map((bm, i) => `
                    <a href="${bm.url}" target="_blank" style="
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: rgba(255,255,255,0.15);
                        color: inherit;
                        border-radius: var(--radius);
                        padding: 0.5rem 1.5rem;
                        margin-bottom: 0.5rem;
                        text-decoration: none;
                        font-weight: 500;
                        border: 1px solid rgba(0,0,0,0.1);
                        width: 100%;
                        word-break: break-word;
                        white-space: normal;
                        ">
                        ${bm.name}
                    </a>`).join('')}
            </div>
        </div>`;
    }

    customOptions() {
        const widget = Widget.allWidgets.find(w => w.id === this._widgetId);
        if (!widget) return document.createElement("div");
        const options = document.createElement("div");
        options.style.display = "flex";
        options.style.flexDirection = "column";
        options.style.gap = "0.5rem";
        options.style.width = "100%";
        options.style.maxHeight = "200px";
        options.style.overflowY = "auto";

        // List bookmarks with edit and remove buttons
        widget.data.bookmarks.forEach((bm, i) => {
            const row = document.createElement("div");
            row.style.display = "flex";
            row.style.alignItems = "center";
            row.style.gap = "0.5rem";

            const nameInput = document.createElement("input");
            nameInput.type = "text";
            nameInput.value = bm.name;
            nameInput.style.flex = "1";
            nameInput.style.padding = "0.25rem 0.5rem";
            nameInput.onchange = () => {
                bm.name = nameInput.value;
                Widget.saveWidgets();
            };

            const urlInput = document.createElement("input");
            urlInput.type = "text";
            urlInput.value = bm.url;
            urlInput.style.flex = "2";
            urlInput.style.padding = "0.25rem 0.5rem";
            urlInput.onchange = () => {
                bm.url = urlInput.value;
                Widget.saveWidgets();
            };

            const removeBtn = document.createElement("button");
            removeBtn.innerText = "Remove";
            removeBtn.style.background = "rgba(255,0,0,0.1)";
            removeBtn.style.cursor = "pointer";
            removeBtn.onclick = () => {
                widget.data.bookmarks.splice(i, 1);
                Widget.saveWidgets();
                this._reload();
                const parent = options.parentElement;
                if (parent) {
                    parent.replaceChild(this.customOptions(), options);
                }
            };

            row.appendChild(nameInput);
            row.appendChild(urlInput);
            row.appendChild(removeBtn);
            options.appendChild(row);
        });

        const addRow = document.createElement("div");
        addRow.style.display = "flex";
        addRow.style.alignItems = "center";
        addRow.style.gap = "0.5rem";

        const newName = document.createElement("input");
        newName.type = "text";
        newName.placeholder = "Name";
        newName.style.flex = "1";
        newName.style.padding = "0.25rem 0.5rem";

        const newUrl = document.createElement("input");
        newUrl.type = "text";
        newUrl.placeholder = "URL (https://...)";
        newUrl.style.flex = "2";
        newUrl.style.padding = "0.25rem 0.5rem";

        const addBtn = document.createElement("button");
        addBtn.innerText = "Add";
        addBtn.style.background = "rgba(0,255,0,0.1)";
        addBtn.style.cursor = "pointer";
        addBtn.onclick = () => {
            if (newName.value.trim() && newUrl.value.trim()) {
                widget.data.bookmarks.push({ name: newName.value.trim(), url: newUrl.value.trim() });
                Widget.saveWidgets();
                this._reload();
                const parent = options.parentElement;
                if (parent) {
                    parent.replaceChild(this.customOptions(), options);
                }
                newName.value = "";
                newUrl.value = "";
            }
        };

        addRow.appendChild(newName);
        addRow.appendChild(newUrl);
        addRow.appendChild(addBtn);
        options.appendChild(addRow);

        return options;
    }

    _reload() {
        const contentElement = document.getElementById(this._widgetId + "-content");
        if (contentElement) {
            contentElement.innerHTML = this.toString();
        }
    }
}

class WeatherWidgetContent extends WidgetContent {
    static style = `
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        overflow-y: auto;
        gap: 0.5rem;
    `;

    static weatherCodeInformation = {"0":{"day":{"description":"Sunny","image":"http://openweathermap.org/img/wn/01d@2x.png"},"night":{"description":"Clear","image":"http://openweathermap.org/img/wn/01n@2x.png"}},"1":{"day":{"description":"Mainly Sunny","image":"http://openweathermap.org/img/wn/01d@2x.png"},"night":{"description":"Mainly Clear","image":"http://openweathermap.org/img/wn/01n@2x.png"}},"2":{"day":{"description":"Partly Cloudy","image":"http://openweathermap.org/img/wn/02d@2x.png"},"night":{"description":"Partly Cloudy","image":"http://openweathermap.org/img/wn/02n@2x.png"}},"3":{"day":{"description":"Cloudy","image":"http://openweathermap.org/img/wn/03d@2x.png"},"night":{"description":"Cloudy","image":"http://openweathermap.org/img/wn/03n@2x.png"}},"45":{"day":{"description":"Foggy","image":"http://openweathermap.org/img/wn/50d@2x.png"},"night":{"description":"Foggy","image":"http://openweathermap.org/img/wn/50n@2x.png"}},"48":{"day":{"description":"Rime Fog","image":"http://openweathermap.org/img/wn/50d@2x.png"},"night":{"description":"Rime Fog","image":"http://openweathermap.org/img/wn/50n@2x.png"}},"51":{"day":{"description":"Light Drizzle","image":"http://openweathermap.org/img/wn/09d@2x.png"},"night":{"description":"Light Drizzle","image":"http://openweathermap.org/img/wn/09n@2x.png"}},"53":{"day":{"description":"Drizzle","image":"http://openweathermap.org/img/wn/09d@2x.png"},"night":{"description":"Drizzle","image":"http://openweathermap.org/img/wn/09n@2x.png"}},"55":{"day":{"description":"Heavy Drizzle","image":"http://openweathermap.org/img/wn/09d@2x.png"},"night":{"description":"Heavy Drizzle","image":"http://openweathermap.org/img/wn/09n@2x.png"}},"56":{"day":{"description":"Light Freezing Drizzle","image":"http://openweathermap.org/img/wn/09d@2x.png"},"night":{"description":"Light Freezing Drizzle","image":"http://openweathermap.org/img/wn/09n@2x.png"}},"57":{"day":{"description":"Freezing Drizzle","image":"http://openweathermap.org/img/wn/09d@2x.png"},"night":{"description":"Freezing Drizzle","image":"http://openweathermap.org/img/wn/09n@2x.png"}},"61":{"day":{"description":"Light Rain","image":"http://openweathermap.org/img/wn/10d@2x.png"},"night":{"description":"Light Rain","image":"http://openweathermap.org/img/wn/10n@2x.png"}},"63":{"day":{"description":"Rain","image":"http://openweathermap.org/img/wn/10d@2x.png"},"night":{"description":"Rain","image":"http://openweathermap.org/img/wn/10n@2x.png"}},"65":{"day":{"description":"Heavy Rain","image":"http://openweathermap.org/img/wn/10d@2x.png"},"night":{"description":"Heavy Rain","image":"http://openweathermap.org/img/wn/10n@2x.png"}},"66":{"day":{"description":"Light Freezing Rain","image":"http://openweathermap.org/img/wn/10d@2x.png"},"night":{"description":"Light Freezing Rain","image":"http://openweathermap.org/img/wn/10n@2x.png"}},"67":{"day":{"description":"Freezing Rain","image":"http://openweathermap.org/img/wn/10d@2x.png"},"night":{"description":"Freezing Rain","image":"http://openweathermap.org/img/wn/10n@2x.png"}},"71":{"day":{"description":"Light Snow","image":"http://openweathermap.org/img/wn/13d@2x.png"},"night":{"description":"Light Snow","image":"http://openweathermap.org/img/wn/13n@2x.png"}},"73":{"day":{"description":"Snow","image":"http://openweathermap.org/img/wn/13d@2x.png"},"night":{"description":"Snow","image":"http://openweathermap.org/img/wn/13n@2x.png"}},"75":{"day":{"description":"Heavy Snow","image":"http://openweathermap.org/img/wn/13d@2x.png"},"night":{"description":"Heavy Snow","image":"http://openweathermap.org/img/wn/13n@2x.png"}},"77":{"day":{"description":"Snow Grains","image":"http://openweathermap.org/img/wn/13d@2x.png"},"night":{"description":"Snow Grains","image":"http://openweathermap.org/img/wn/13n@2x.png"}},"80":{"day":{"description":"Light Showers","image":"http://openweathermap.org/img/wn/09d@2x.png"},"night":{"description":"Light Showers","image":"http://openweathermap.org/img/wn/09n@2x.png"}},"81":{"day":{"description":"Showers","image":"http://openweathermap.org/img/wn/09d@2x.png"},"night":{"description":"Showers","image":"http://openweathermap.org/img/wn/09n@2x.png"}},"82":{"day":{"description":"Heavy Showers","image":"http://openweathermap.org/img/wn/09d@2x.png"},"night":{"description":"Heavy Showers","image":"http://openweathermap.org/img/wn/09n@2x.png"}},"85":{"day":{"description":"Light Snow Showers","image":"http://openweathermap.org/img/wn/13d@2x.png"},"night":{"description":"Light Snow Showers","image":"http://openweathermap.org/img/wn/13n@2x.png"}},"86":{"day":{"description":"Snow Showers","image":"http://openweathermap.org/img/wn/13d@2x.png"},"night":{"description":"Snow Showers","image":"http://openweathermap.org/img/wn/13n@2x.png"}},"95":{"day":{"description":"Thunderstorm","image":"http://openweathermap.org/img/wn/11d@2x.png"},"night":{"description":"Thunderstorm","image":"http://openweathermap.org/img/wn/11n@2x.png"}},"96":{"day":{"description":"Light Thunderstorms With Hail","image":"http://openweathermap.org/img/wn/11d@2x.png"},"night":{"description":"Light Thunderstorms With Hail","image":"http://openweathermap.org/img/wn/11n@2x.png"}},"99":{"day":{"description":"Thunderstorm With Hail","image":"http://openweathermap.org/img/wn/11d@2x.png"},"night":{"description":"Thunderstorm With Hail","image":"http://openweathermap.org/img/wn/11n@2x.png"}}};

    constructor(widgetId) {
        super(widgetId);
        this._content = "Weather Widget Content";

        this._temperatureFormat = "F";
        if (widgetId == null) return;
        const widget = Widget.allWidgets.find(w => w.id === widgetId);
        this._temperatureFormat = widget.data["temperatureFormat"] || "F";

        
    }

    async _getPosition() {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    position => {
                        resolve(position);
                    },
                    error => {
                        reject(error);
                    }
                );
            } else {
                reject(new Error("Geolocation is not supported by this browser."));
            }
        });
    }

    async _fetchWeatherData() {
        const position = await this._getPosition();
        console.log("Position:", position);
        this._latitude = position.coords.latitude;
        this._longitude = position.coords.longitude;

        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${this._latitude}&longitude=${this._longitude}&current=temperature_2m,is_day,precipitation,rain,showers,snowfall,weather_code`);
        if (!response.ok) {
            console.error("Failed to fetch weather data:", response.statusText);
        }
        return await response.json();

    }

    async _generateWeatherContent() {

        const data = (await this._fetchWeatherData()).current;
        const { temperature_2m, is_day, precipitation, rain, showers, snowfall, weather_code } = data;

        const info = WeatherWidgetContent.weatherCodeInformation[weather_code][is_day ? "day" : "night"];
        const temp = this._temperatureFormat === "F" ? (temperature_2m * 9/5) + 32 : temperature_2m;
        const imgTag = `<img draggable="false" style="width: auto; height: 190%;" src="${info.image}" alt="${info['description']}">`;
        console.log(info);
        const html = `
            <div class="centered-vertically centered-horizontally" style="width: 80%; height: 80%;">${imgTag}</div>
            <p style="margin: 0;">${info['description']}, Temperature: ${Math.round(temp * 100) / 100}°${this._temperatureFormat}</p>
        `

        document.getElementById(this._widgetId + '-weather-content').innerHTML = html;
    }

    toString() {

        if (!this._widgetId) {
            const info = WeatherWidgetContent.weatherCodeInformation["0"]["day"];
            const temp = 50;
            const imgTag = `<img draggable="false" style="width: auto; height: 190%;" src="${info.image}" alt="${info['description']}">`;
            console.log(info);
            const html = `
                <div class="centered-vertically centered-horizontally" style="width: 80%; height: 80%;">${imgTag}</div>
                <p style="margin: 0;">${info['description']}, Temperature: ${Math.round(temp * 100) / 100}°${this._temperatureFormat}</p>
            `
            return `<div class="hidden-scrollbar" style="${WeatherWidgetContent.style}">${html}</div>`;
        }

        this._generateWeatherContent();
        return `<div id="${this._widgetId + '-weather-content'}" class="hidden-scrollbar" style="${WeatherWidgetContent.style}">Loading...</div>`;
    }

    customOptions() {
        const options = document.createElement("div");
        options.style.display = "flex";
        options.style.flexDirection = "column";
        options.style.gap = "0.5rem";
        options.style.width = "100%";

        const tempFormatLabel = document.createElement("label");
        tempFormatLabel.innerText = "Temperature Format:";
        const tempFormatSelect = document.createElement("select");
        tempFormatSelect.style.width = "10rem";
        tempFormatSelect.style.padding = "0.25rem";
        tempFormatSelect.innerHTML = `
            <option style="background-color: rgba(0, 0, 0, 0.7); color: inherit;" value="F">Fahrenheit (°F)</option>
            <option style="background-color: rgba(0, 0, 0, 0.7); color: inherit;" value="C">Celsius (°C)</option>
        `;
        tempFormatSelect.value = this._temperatureFormat;
        tempFormatSelect.onchange = () => {
            this._temperatureFormat = tempFormatSelect.value;
            this._generateWeatherContent();
            const widget = Widget.allWidgets.find(w => w.id === this._widgetId);
            if (widget) {
                widget.data["temperatureFormat"] = this._temperatureFormat;
                Widget.saveWidgets();
            }
        };

        options.appendChild(tempFormatLabel);
        options.appendChild(tempFormatSelect);

        return options;
    }
}

allWidgetContents.push(ClockWidgetContent);
allWidgetContents.push(SearchBarWidgetContent);
allWidgetContents.push(BookmarkBarWidgetContent);
allWidgetContents.push(WeatherWidgetContent);
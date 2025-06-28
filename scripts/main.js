import Widget from "./widget.js"
window.closeWidget = (id) => {
    Widget.closeWidget(id);
};

window.openWidgetSettings = (id) => {
    Widget.openWidgetSettings(id);
};

window.createWidget = () => {
    let w = new Widget();
    document.body.appendChild(w.element);
}

window.modalClose = (action) => {
    Widget.modalClose(action);
}

const main = () => {

    fetch("backgrounds.json")
    .then(response => response.json())
    .then(data => {
        document.body.style.backgroundImage = `url(/assets/backgrounds/${data[Math.floor(Math.random() * data.length)]})`;
    })


    if (Widget.loadWidgets()) {
        return;
    }

    let w = new Widget();

    document.body.appendChild(w.element);
}

window.onload = main;
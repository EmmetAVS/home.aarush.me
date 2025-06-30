import {Widget, animateOpenModal, animateCloseModal} from "./widget.js"
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

window.updateWidgetColors = () => {
    Widget.updateColors();
}

window.openBackgroundModal = openBackgroundModal;

window.closeBackgroundModal = closeBackgroundModal;

window.updateWidgetHeaderVisibility = Widget.updateWidgetHeaderVisibility

window.updateBackground = updateBackground;

window.selectBackground = selectBackground;

let backgrounds;

function setBackgroundsForModal() {
    const backgroundSelect = document.getElementById("backgrounds");
    backgroundSelect.innerHTML = "";

    for (const background of backgrounds) {
        backgroundSelect.innerHTML += `
            <div onclick="selectBackground('${background}')" class="modal-widget-content-option background-option" style="background-image: url(./assets/backgrounds/${background});"></div>
        `;
    }

    document.getElementById("customBackground").value = localStorage.getItem("background").includes("./assets/backgrounds/") ? "" : localStorage.getItem("background");
    document.getElementById("customBackground").addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            document.body.style.backgroundImage = `url(${document.getElementById("customBackground").value})`;

            document.getElementById("keepBackground").value = 2;

            localStorage.setItem("background", document.body.style.backgroundImage);
        }
    })
}

function main() {

    fetch("backgrounds.json")
    .then(response => response.json())
    .then(data => {
        backgrounds = data;
        if (!localStorage.getItem("background")) {
            document.body.style.backgroundImage = `url(./assets/backgrounds/${data[Math.floor(Math.random() * data.length)]})`;
        } else {
            document.body.style.backgroundImage = localStorage.getItem("background");
        }
        setBackgroundsForModal();
    })


    if (Widget.loadWidgets()) {
        return;
    }
}

function openBackgroundModal() {
    animateOpenModal(document.getElementById("backgroundModal"));
    document.getElementById("keepBackground").value = localStorage.getItem("background") ? 2 : 1;
}

function closeBackgroundModal() {
    animateCloseModal(document.getElementById("backgroundModal"));
}

function updateBackground() {
    const keepBackground = document.getElementById("keepBackground").value == 2;
    if (keepBackground) {
        localStorage.setItem("background", document.body.style.backgroundImage);
    } else {
        localStorage.removeItem("background");
    }
}

function selectBackground(background) {
    document.body.style.backgroundImage = `url(./assets/backgrounds/${background})`;

    document.getElementById("keepBackground").value = 2;

    localStorage.setItem("background", document.body.style.backgroundImage);
}

window.onload = main;
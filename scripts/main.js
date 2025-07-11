import {Widget, animateOpenModal, animateCloseModal} from "./widget.js"
window.closeWidget = (id) => {
    Widget.closeWidget(id);
};

window.openWidgetSettings = (id) => {
    Widget.openWidgetSettings(id);
};

window.createWidget = () => {
    let w = new Widget();
    document.getElementById("widgetContainer").appendChild(w.element);
}

window.modalClose = (action) => {
    Widget.modalClose(action);
}

window.updateWidgetColors = () => {
    Widget.updateColors();
}

window.closeImportExportModal = () => {
    animateCloseModal(document.getElementById("importExportModal"));
}

window.getLink = () => {

    const data = (document.getElementById('exportTextArea').value);
    navigator.clipboard.writeText(window.location.href + "404.html#" + data);
}

window.openBackgroundModal = openBackgroundModal;

window.closeBackgroundModal = closeBackgroundModal;

window.updateWidgetHeaderVisibility = Widget.updateWidgetHeaderVisibility

window.updateBackground = updateBackground;

window.selectBackground = selectBackground;

window.openImportExportModal = openImportExportModal;

window.importData = importData;

window.importSerializedData = importSerializedData;

let backgrounds, backgroundElement;

function addModalBackgroundListener() {
    for (const background of document.getElementsByClassName("modal-background")) {
        background.addEventListener("click", (e) => {
            if (e.target === background) animateCloseModal(background);
        });
    }
}

function openImportExportModal(action) {
    animateOpenModal(document.getElementById("importExportModal"));

    if (action == "import") {
        document.getElementById("importExportModalTitle").innerText = "Import Data";
        document.getElementById("exportTextArea").value = "";
        document.getElementById("exportTextArea").placeholder = "Paste your exported data here...";
        document.getElementById("importButton").readonly = false;
        document.getElementById("exportButton").style.display = "none";
        document.getElementById("importButton").style.display = "flex";
        document.getElementById("getLinkButton").style.display = "none";
    } else if (action == "export") {
        document.getElementById("importExportModalTitle").innerText = "Export Data";
        document.getElementById("exportTextArea").value = serializeData();
        document.getElementById("importButton").readonly = true;
        document.getElementById("importButton").style.display = "none";
        document.getElementById("exportButton").style.display = "flex";
        document.getElementById("getLinkButton").style.display = "flex";

    }
}

function serializeData() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
    }
    const str = JSON.stringify(data);
    return LZString.compressToBase64(str);
}

function importSerializedData(b64) {
    try {

        const json = LZString.decompressFromBase64(b64);
        const data = JSON.parse(json);
        const obj = Object.entries(data);
        localStorage.clear();

        for (const [key, value] of obj) {
            localStorage.setItem(key, value);
        }

        console.log("Expected window size:", localStorage.getItem("expectedWindowWidth"), "x", localStorage.getItem("expectedWindowHeight"));

        return true;

    } catch (e) {
        console.error("Failed to import data:", e);
        return false;
    }

}

function importData() {

    if (importSerializedData(document.getElementById("exportTextArea").value)) {
        console.log("Data imported successfully");
        animateCloseModal(document.getElementById("importExportModal"));
        main();
    }

}

function setBackgroundsForModal() {
    const backgroundSelect = document.getElementById("backgrounds");
    backgroundSelect.innerHTML = "";

    for (const background of backgrounds) {
        backgroundSelect.innerHTML += `
            <div onclick="selectBackground('${background}')" class="modal-widget-content-option background-option" style="background-image: url(./assets/backgrounds/${background});"></div>
        `;
    }

    if (localStorage.getItem("background"))
        document.getElementById("customBackground").value = localStorage.getItem("background").includes("./assets/backgrounds/") ? "" : localStorage.getItem("background").split('"')[1];
    document.getElementById("customBackground").addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            backgroundElement.style.backgroundImage = `url(${document.getElementById("customBackground").value})`;

            document.getElementById("keepBackground").value = 2;

            localStorage.setItem("background", backgroundElement.style.backgroundImage);
        }
    })
}

function main() {

    backgroundElement = document.getElementById("backgroundImage");

    fetch("backgrounds.json")
    .then(response => response.json())
    .then(data => {
        backgrounds = data;
        if (!localStorage.getItem("background")) {
            backgroundElement.style.backgroundImage = `url(./assets/backgrounds/${data[Math.floor(Math.random() * data.length)]})`;
        } else {
            backgroundElement.style.backgroundImage = localStorage.getItem("background");
        }

        if (!localStorage.getItem("backgroundOpacity")) {
            localStorage.setItem("backgroundOpacity", 90);
        }
        backgroundElement.style.opacity = localStorage.getItem("backgroundOpacity") / 100;
        document.getElementById("backgroundOpacity").value = localStorage.getItem("backgroundOpacity");
        setBackgroundsForModal();
        addModalBackgroundListener();
    })


    Widget.loadWidgets()
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
        localStorage.setItem("background", backgroundElement.style.backgroundImage);
    } else {
        localStorage.removeItem("background");
    }

    const backgroundOpacity = document.getElementById("backgroundOpacity").value;
    localStorage.setItem("backgroundOpacity", backgroundOpacity);
    backgroundElement.style.opacity = backgroundOpacity / 100;
}

function selectBackground(background) {
    backgroundElement.style.backgroundImage = `url(./assets/backgrounds/${background})`;

    document.getElementById("keepBackground").value = 2;

    localStorage.setItem("background", backgroundElement.style.backgroundImage);
}

if (!window.onload) window.onload = main;
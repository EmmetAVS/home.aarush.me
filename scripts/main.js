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

window.closeImportExportModal = () => {
    animateCloseModal(document.getElementById("importExportModal"));
}

window.openBackgroundModal = openBackgroundModal;

window.closeBackgroundModal = closeBackgroundModal;

window.updateWidgetHeaderVisibility = Widget.updateWidgetHeaderVisibility

window.updateBackground = updateBackground;

window.selectBackground = selectBackground;

window.openImportExportModal = openImportExportModal;

window.importData = importData;

let backgrounds;

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
    } else if (action == "export") {
        document.getElementById("importExportModalTitle").innerText = "Export Data";
        document.getElementById("exportTextArea").value = serializeData();
        document.getElementById("importButton").readonly = true;
        document.getElementById("importButton").style.display = "none";
        document.getElementById("exportButton").style.display = "flex";

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

        localStorage.clear();

        const json = LZString.decompressFromBase64(b64);
        const data = JSON.parse(json);
        for (const [key, value] of Object.entries(data)) {
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
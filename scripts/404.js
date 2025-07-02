let path = window.location.href.split("/").pop();

window.onload = () => {
    console.log("404 page loaded");
    console.log(path);

    if (window.importSerializedData(path)) {
        console.log('success');
    } else {
        console.log("failure");
    }

    window.location.href = "./";
}
//renderer process
const { ipcRenderer } = require("electron");

const preview = document.querySelector(".preview");
const list = document.querySelector(".list");
let focused = null;

preview.addEventListener("drop", (event) => {
  event.preventDefault();
  event.stopPropagation();

  if (!focused) {
    return;
  }

  ipcRenderer.send("replace-image", {
    index: parseInt(focused.id.split("-")[1]),
    path: event.dataTransfer.files[0].path,
  });
});

preview.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.stopPropagation();
});

ipcRenderer.on("update-preview", (event, data) => {
  preview.src = `data:image/png;base64,${Buffer.from(data).toString("base64")}`;
});

ipcRenderer.on("update-miniature", (event, { index, data }) => {
  list.querySelector(
    `#btn-${index} > img`
  ).src = `data:image/png;base64,${Buffer.from(data).toString("base64")}`;
});

ipcRenderer.on("populate-list", (event, images) => {
  focused = null;

  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }

  for (const [index, image] of images.entries()) {
    if (!image.isImage) {
      continue;
    }

    const btn = document.createElement("button");
    btn.innerText = image.name;
    btn.id = `btn-${index}`;
    btn.onclick = (event) => {
      if (focused == event.target) {
        return;
      }

      if (focused) {
        focused.classList.remove("focused");
      }

      focused = event.target;
      focused.classList.add("focused");
      ipcRenderer.send("get-image-data", index);
    };

    const img = document.createElement("img");
    img.className = "miniature";
    img.src = `data:image/png;base64,${Buffer.from(image.data).toString(
      "base64"
    )}`;
    btn.appendChild(img);

    list.appendChild(btn);
  }
});

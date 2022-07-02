//renderer process
import { ipcRenderer } from 'electron';
import ImageBuffer from '../types/imageBuffer';

const preview: any = document.querySelector('.preview');
const list: any = document.querySelector('.list');
let focused: any = null;

preview?.addEventListener('drop', (event: any) => {
  event.preventDefault();
  event.stopPropagation();

  if (!focused) {
    return;
  }

  ipcRenderer.send('replace-image', {
    index: parseInt(focused.id.split('-')[1], 10),
    path: event.dataTransfer.files[0].path,
  });
});

preview?.addEventListener('dragover', (event: any) => {
  event.preventDefault();
  event.stopPropagation();
});

ipcRenderer.on(
  'update-preview',
  (_: Electron.IpcRendererEvent, data: Buffer) => {
    if (preview) {
      preview.src = `data:image/png;base64,${Buffer.from(data).toString(
        'base64'
      )}`;
    }
  }
);

ipcRenderer.on(
  'update-miniature',
  (_: Electron.IpcRendererEvent, { index, data }: ImageBuffer) => {
    list.querySelector(
      `#btn-${index} > img`
    ).src = `data:image/png;base64,${Buffer.from(data).toString('base64')}`;
  }
);

ipcRenderer.on(
  'populate-list',
  (_: Electron.IpcRendererEvent, images: any[]) => {
    focused = null;

    while (list.firstChild) {
      list.removeChild(list.firstChild);
    }

    for (const [index, image] of images.entries()) {
      if (!image.isImage) {
        continue;
      }

      const btn = document.createElement('button');
      btn.innerText = image.name;
      btn.id = `btn-${index}`;
      btn.onclick = (event) => {
        if (focused == event.target) {
          return;
        }

        if (focused) {
          focused.classList.remove('focused');
        }

        focused = event.target;
        focused.classList.add('focused');
        ipcRenderer.send('get-image-data', index);
      };

      const img = document.createElement('img');
      img.className = 'miniature';
      img.src = `data:image/png;base64,${Buffer.from(image.data).toString(
        'base64'
      )}`;
      btn.appendChild(img);

      list.appendChild(btn);
    }
  }
);

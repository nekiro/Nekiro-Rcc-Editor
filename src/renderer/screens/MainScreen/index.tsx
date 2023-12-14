import React, { useEffect, useState } from 'react';
import SelectableList from '../../components/SelectableList';
import styles from './style.css';
import { Image } from '../../../types/image';
import Preview from '../../components/Preview';
import useSelectedElement from '../../../renderer/hooks/useSelectedElement';

export default function MainScreen() {
  const [images, setImages] = useState<Image[]>([]);
  const [, setElement] = useSelectedElement();

  useEffect(() => {
    window.api.handlers.listImages.subscribe(
      (_: Electron.IpcRendererEvent, images: Image[]) => {
        setElement();
        setImages(images);
      },
    );
    window.api.handlers.listImage.subscribe(
      (_: Electron.IpcRendererEvent, index: number, image: Image) =>
        setImages((state) =>
          Object.values<Image>({ ...state, [index]: image }),
        ),
    );

    return () => {
      window.api.handlers.listImages.unsubscribe();
      window.api.handlers.listImage.unsubscribe();
    };
  }, []);

  return (
    <div className={styles.main}>
      <SelectableList images={images} />
      <div
        className={`${styles['center-container']} ${styles['miniature-holder']}`}
      >
        <Preview />
      </div>
    </div>
  );
}

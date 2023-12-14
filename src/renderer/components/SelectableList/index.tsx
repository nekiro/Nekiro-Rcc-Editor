import React from 'react';
import ImageButton from '../ImageButton';
import styles from './style.css';
import { Image } from '../../../types/image';
import useSelectedElement from '../../hooks/useSelectedElement';

type SelectableListProps = {
  images: Image[];
};

export default function SelectableList({ images }: SelectableListProps) {
  const [selected, setElement] = useSelectedElement();

  return (
    <div className={styles.list}>
      {images.map((image, index) => (
        <ImageButton
          onClick={(event) => setElement(event.currentTarget, image)}
          id={`btn-${index}`}
          image={image}
          key={`btn-${index}`}
          className={
            selected.element?.id === `btn-${index}` ? styles.selected : ''
          }
        />
      ))}
    </div>
  );
}

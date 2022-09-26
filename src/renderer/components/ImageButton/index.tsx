import React from 'react';
import styles from './style.css';
import { Image } from '../../../types/Image';

type ImageButtonProps = {
  image: Image;
  id: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
};

export default function ImageButton({
  image,
  id,
  onClick,
  ...props
}: ImageButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} id={id} onClick={onClick}>
      {image.name}
      <img
        src={`data:image/png;base64,${image.data}`}
        className={styles.miniature}
      />
    </button>
  );
}

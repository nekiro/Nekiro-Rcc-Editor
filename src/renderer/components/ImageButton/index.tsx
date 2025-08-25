import React from "react";
import styles from "./style.css";
import { Image } from "../../../types/image";

type ImageButtonProps = {
	image: Image;
	id: string;
	onClick: React.MouseEventHandler<HTMLButtonElement>;
	onDrop?: React.DragEventHandler<HTMLButtonElement>;
	onDragOver?: React.DragEventHandler<HTMLButtonElement>;
	onDragStart?: React.DragEventHandler<HTMLButtonElement>;
};

export default function ImageButton({
	image,
	id,
	onClick,
	onDrop,
	onDragOver,
	onDragStart,
	...props
}: ImageButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
	return (
		<button {...props} id={id} onClick={onClick} onDrop={onDrop} onDragOver={onDragOver} onDragStart={onDragStart}>
			{image.name}
			<img src={`data:image/png;base64,${image.data}`} className={styles.miniature} />
		</button>
	);
}

import React from "react";
import useSelectedElement from "../../hooks/useSelectedElement";
import styles from "./style.css";

export default function Preview() {
	const [selected, setSelected] = useSelectedElement();

	const onDropToPreview = async (event: React.DragEvent<HTMLImageElement>) => {
		event.preventDefault();
		event.stopPropagation();

		if (!selected.element || !event.dataTransfer.files[0].path) return;

		const image = await window.api.replaceImage(parseInt(selected.element.id.split("-")[1], 10), event.dataTransfer.files[0].path);

		setSelected(selected.element, image);
	};

	const onDragOverToPreview = (event: React.DragEvent<HTMLImageElement>) => {
		event.preventDefault();
		event.stopPropagation();
	};

	return (
		<img
			onDrop={onDropToPreview}
			onDragOver={onDragOverToPreview}
			className={`${styles.preview} ${selected.element ? styles.visible : ""}`}
			src={selected.element ? `data:image/png;base64,${selected.image?.data}` : ""}
		/>
	);
}

import React from "react";
import useSelectedElement from "../../hooks/useSelectedElement";
import styles from "./style.css";

export default function Preview() {
	const [selected, setSelected] = useSelectedElement();

	const onDropToPreview = async (event: React.DragEvent<HTMLImageElement>) => {
		event.preventDefault();
		event.stopPropagation();

		if (!selected.element) return;

		let filePath: string | undefined;

		if (event.dataTransfer.files[0]?.path) {
			filePath = event.dataTransfer.files[0].path;
		} else if (event.dataTransfer.items[0]?.getAsFile()) {
			const file = event.dataTransfer.items[0].getAsFile();
			if (file) {
				const reader = new FileReader();
				reader.onload = async (e) => {
					if (e.target?.result) {
						try {
							const index = parseInt(selected.element!.id.split("-")[1], 10);
							const image = await window.api.replaceImageWithData(index, e.target.result as ArrayBuffer);
							if (image) {
								setSelected(selected.element!, image);
							}
						} catch (error) {
							console.error("Error replacing image:", error);
						}
					}
				};
				reader.readAsArrayBuffer(file);
				return;
			}
		}

		if (!filePath) return;

		try {
			const index = parseInt(selected.element.id.split("-")[1], 10);
			const image = await window.api.replaceImage(index, filePath);
			if (image) {
				setSelected(selected.element, image);
			}
		} catch (error) {
			console.error("Error replacing image:", error);
		}
	};

	const onDragOverToPreview = (event: React.DragEvent<HTMLImageElement>) => {
		event.preventDefault();
		event.stopPropagation();
	};

	const onDragStartFromPreview = (event: React.DragEvent<HTMLImageElement>) => {
		if (!selected.element || !selected.image) return;

		event.dataTransfer.setData("text/plain", selected.image.name);
		event.dataTransfer.setData("text/uri-list", `data:image/png;base64,${selected.image.data}`);
		event.dataTransfer.setData("image/png", `data:image/png;base64,${selected.image.data}`);
		event.dataTransfer.setData("application/octet-stream", `data:image/png;base64,${selected.image.data}`);

		const img = new Image();
		img.src = `data:image/png;base64,${selected.image.data}`;
		event.dataTransfer.setDragImage(img, 0, 0);

		event.dataTransfer.effectAllowed = "copyMove";
		event.dataTransfer.setData("DownloadURL", `image/png:${selected.image.name}:data:image/png;base64,${selected.image.data}`);
	};

	return (
		<img
			onDrop={onDropToPreview}
			onDragOver={onDragOverToPreview}
			onDragStart={onDragStartFromPreview}
			className={`${styles.preview} ${selected.element ? styles.visible : ""}`}
			src={selected.element ? `data:image/png;base64,${selected.image?.data}` : ""}
		/>
	);
}

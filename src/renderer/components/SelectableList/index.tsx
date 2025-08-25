import React from "react";
import ImageButton from "../ImageButton";
import styles from "./style.css";
import { Image } from "../../../types/image";
import useSelectedElement from "../../hooks/useSelectedElement";

type SelectableListProps = {
	images: Image[];
};

export default function SelectableList({ images }: SelectableListProps) {
	const [selected, setElement] = useSelectedElement();

	React.useEffect(() => {
		const handleGlobalDragOver = (event: DragEvent) => {
			event.preventDefault();
			event.dataTransfer!.dropEffect = "copy";
		};

		const handleGlobalDrop = (event: DragEvent) => {
			event.preventDefault();
		};

		document.addEventListener("dragover", handleGlobalDragOver);
		document.addEventListener("drop", handleGlobalDrop);

		return () => {
			document.removeEventListener("dragover", handleGlobalDragOver);
			document.removeEventListener("drop", handleGlobalDrop);
		};
	}, []);

	const handleDrop = async (event: React.DragEvent<HTMLButtonElement>, index: number) => {
		event.preventDefault();
		event.stopPropagation();

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
							const image = await window.api.replaceImageWithData(index, e.target.result as ArrayBuffer);
							if (image) {
								setElement(event.currentTarget, image);
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
			const image = await window.api.replaceImage(index, filePath);
			if (image) {
				setElement(event.currentTarget, image);
			}
		} catch (error) {
			console.error("Error replacing image:", error);
		}
	};

	const handleDragOver = (event: React.DragEvent<HTMLButtonElement>) => {
		event.preventDefault();
		event.stopPropagation();
	};

	const handleDragStart = (event: React.DragEvent<HTMLButtonElement>, image: Image) => {
		event.dataTransfer.setData("text/plain", image.name);
		event.dataTransfer.setData("text/uri-list", `data:image/png;base64,${image.data}`);
		event.dataTransfer.setData("image/png", `data:image/png;base64,${image.data}`);
		event.dataTransfer.setData("application/octet-stream", `data:image/png;base64,${image.data}`);

		const img = new Image();
		img.src = `data:image/png;base64,${image.data}`;
		event.dataTransfer.setDragImage(img, 0, 0);

		event.dataTransfer.effectAllowed = "copyMove";
		event.dataTransfer.setData("DownloadURL", `image/png:${image.name}:data:image/png;base64,${image.data}`);
	};

	return (
		<div className={styles.list}>
			{images.map((image, index) => (
				<ImageButton
					onClick={(event) => setElement(event.currentTarget, image)}
					onDrop={(event) => handleDrop(event, index)}
					onDragOver={handleDragOver}
					onDragStart={(event) => handleDragStart(event, image)}
					id={`btn-${index}`}
					image={image}
					key={`btn-${index}`}
					className={selected.element?.id === `btn-${index}` ? styles.selected : ""}
				/>
			))}
		</div>
	);
}

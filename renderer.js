import { ShipmentManager } from "./src/shipment/ShipmentManager.js";

const openFileButton = document.getElementById("open-file-btn");
const xmlContentContainer = document.getElementById("xml-content");

openFileButton.addEventListener("click", handleOpenFile);

async function handleOpenFile() {
	const fileContent = await window.fileApi.selectFile();

	console.log({ fileContent });

	if (!fileContent?.shipment || !fileContent) {
		console.log("No se pudo obtener el contenido del archivo.");
		return;
	}

	xmlContentContainer.innerHTML = "";

	const shipment = new ShipmentManager({
		Shipment: fileContent.shipment,
		ShipmentOriginal: fileContent.ShipmentOriginal,
		FileName: fileContent.fileName,
	});

	shipment.render();
}

// Escuchar el evento desde el menú para abrir el archivo
window.ipcRenderer.openFileEvent(handleOpenFile);

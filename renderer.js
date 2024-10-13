import { Shipment } from "./src/shipment/Shipment.js";

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

	const shipment = new Shipment({
		Shipment: fileContent.shipment,
		Original: fileContent.original,
		FileName: fileContent.fileName,
	});

	const table = await shipment.createTable();
	const panelInfo = await shipment.createPanelInfo();

	if (panelInfo) {
		xmlContentContainer.appendChild(panelInfo);
	}

	if (table) {
		xmlContentContainer.appendChild(table);
		shipment.setEventListeners();
	}
}

// Escuchar el evento desde el menú para abrir el archivo
window.ipcRenderer.openFileEvent(handleOpenFile);

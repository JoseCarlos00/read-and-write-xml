import { Shipment } from "./src/shipment/Shipment.js";

const openFileButton = document.getElementById("open-file-btn");
const xmlContentContainer = document.getElementById("xml-content");

openFileButton.addEventListener("click", handleOpenFile);

async function handleOpenFile() {
	console.log("Se hizo click:", window.fileApi);
	const fileContent = await window.fileApi.selectFile();

	console.log({ fileContent });
	if (!fileContent) {
		console.log("No se pudo obtener el contenido del archivo.");
		return;
	}

	console.log({ fileContent });
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
		shipment.setEventListener();
	}
}

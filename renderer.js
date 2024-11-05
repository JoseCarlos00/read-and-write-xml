import { ShipmentManager } from "./src/shipment/ShipmentManager.js";
import { TabManager } from "./src/js/TabManager.js";

const openFileButton = document.getElementById("open-file-btn");

openFileButton.addEventListener("click", handleOpenFile);

async function handleOpenFile() {
	try {
		const fileContent = await window.fileApi.selectFile();

		console.log({ fileContent });

		if (!fileContent?.shipment || !fileContent) {
			throw new Error("No se pudo obtener el contenido del archivo.");
		}

		createNewTab({
			Shipment: fileContent.shipment,
			ShipmentOriginal: fileContent.ShipmentOriginal,
			FileName: fileContent.fileName,
		});
	} catch (error) {
		console.error("Detalles del error:", error);
		showUserError("No se pudo abrir el archivo.");
	}
}

/**
 * Muestra un mensaje de error al usuario y lo registra en la consola.
 * @param {string} message - Mensaje de error a mostrar.
 */
function showUserError(message) {
	alert(message);
}

// Escuchar el evento desde el menú para abrir el archivo
window.ipcRenderer.openFileEvent(handleOpenFile);

async function handleOpenFileInWindows(event, filePath) {
	try {
		console.log("Archivo abierto desde el explorador:", filePath);

		const fileContent = await window.fileApi.readFile({ filePath });

		console.log({ fileContent });

		createNewTab({
			Shipment: fileContent.shipment,
			ShipmentOriginal: fileContent.ShipmentOriginal,
			FileName: fileContent.fileName,
		});
	} catch (error) {
		console.error("Error al abrir el archivo:", error);
		showUserError("No se pudo abrir el archivo.");
	}
}

let currenfile = 1;

const tabManager = new TabManager("tabs-container", "content-container");

function createNewTab({ Shipment, ShipmentOriginal, FileName }) {
	// const shipment = new ShipmentManager({
	// 	Shipment,
	// 	ShipmentOriginal,
	// 	FileName,
	// });
	// shipment.render();

	tabManager.createNewTab(FileName, `This is the content of file${currenfile}.xml`);
}

window.ipcRenderer.openFileWindows(handleOpenFileInWindows);

async function setCurrentVersion() {
	document.querySelector("#version").innerHTML = (await window.bridge.version()) ?? "No disponible";
}

window.addEventListener("load", setCurrentVersion);

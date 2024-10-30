import { ShipmentManager } from "./src/shipment/ShipmentManager.js";

const openFileButton = document.getElementById("open-file-btn");
const xmlContentContainer = document.getElementById("xml-content");

openFileButton.addEventListener("click", handleOpenFile);

async function handleOpenFile() {
	try {
		const fileContent = await window.fileApi.selectFile();

		console.log({ fileContent });

		if (!fileContent?.shipment || !fileContent) {
			throw new Error("No se pudo obtener el contenido del archivo.");
		}

		xmlContentContainer.innerHTML = "";

		const shipment = new ShipmentManager({
			Shipment: fileContent.shipment,
			ShipmentOriginal: fileContent.ShipmentOriginal,
			FileName: fileContent.fileName,
		});

		shipment.render();
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

window.bridge.updateMessage(updateMessage);

function updateMessage(event, message) {
	console.log("[Renderer.js]");
	console.log(message);
}

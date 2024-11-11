import { ShipmentManager } from "./src/shipment/ShipmentManager.js";
import { ReceiptManager } from "./src/receipt/ReceipManager.js";
import { TabManager } from "./src/js/TabManager.js";

function handeleCreateTypeTabs({ fileContent }) {
	if (!fileContent || !fileContent.dataResult) {
		// return;
		throw new Error("No se seleccionaron archivos o están vacíos. En:", fileContent?.filePath);
	}

	if (fileContent.dataResult.name === "Receipt") {
		createNewReceiptTab({
			Receipt: fileContent.dataResult.data,
			ReceiptOriginal: fileContent.fileOriginal,
			FileName: fileContent.fileName,
			FilePath: fileContent.filePath,
		});

		return;
	}

	if (fileContent.dataResult.name === "Shipment") {
		createNewShiptmnetTab({
			Shipment: fileContent.dataResult.data,
			ShipmentOriginal: fileContent.fileOriginal,
			FileName: fileContent.fileName,
			FilePath: fileContent.filePath,
		});

		return;
	}

	console.log("Tipo de Formato desconosido:", {
		name: fileContent.dataResult.name,
		data: fileContent.dataResult.data,
		path: fileContent.filePath,
	});
}

async function handleOpenFileMultiple() {
	try {
		const filesContent = await window.fileApi.selectFile();

		console.log("filesContent:", { filesContent });

		if (!filesContent || filesContent.length === 0) {
			throw new Error("No se seleccionaron archivos o están vacíos.");
		}

		// Iterar sobre cada archivo y crear una pestaña para cada uno
		filesContent.forEach((fileContent) => {
			handeleCreateTypeTabs({ fileContent });
		});
	} catch (error) {
		console.error("Detalles del error:", error);
		showUserError("No se pudieron abrir los archivos.");
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
window.ipcRenderer.openFileEvent(handleOpenFileMultiple);

async function handleOpenFileInWindows(event, filePath) {
	try {
		console.log("Archivo abierto desde el explorador:", filePath);

		const fileContent = await window.fileApi.readFile({ filePath });

		handeleCreateTypeTabs({ fileContent });
	} catch (error) {
		console.error("Error al abrir el archivo:", error);
		showUserError("No se pudo abrir el archivo.");
	}
}

const tabManager = new TabManager({
	tabsContainerId: "tabs-container",
	contentContainerId: "content-container",
});

function createNewShiptmnetTab({ Shipment, ShipmentOriginal, FileName, FilePath }) {
	try {
		const contentContainer = tabManager.createNewTab(FileName);

		if (contentContainer?.status === "existe") {
			return;
		}

		if (!contentContainer) {
			throw new Error("No se pudo crear un nuevo tab: No existe [contentContainer].");
		}

		const shipment = new ShipmentManager({
			Shipment,
			ShipmentOriginal,
			FileName,
			FilePath,
			contentContainer,
		});

		shipment.render();
	} catch (error) {
		console.error("Error al crear el nuevo tab:", error);
	}
}

function createNewReceiptTab({ Receipt, ReceiptOriginal, FileName, FilePath }) {
	try {
		const contentContainer = tabManager.createNewTab(FileName);

		if (contentContainer?.status === "existe") {
			return;
		}

		if (!contentContainer) {
			throw new Error("No se pudo crear un nuevo tab: No existe [contentContainer].");
		}

		const receiptManager = new ReceiptManager({
			Receipt,
			ReceiptOriginal,
			FileName,
			FilePath,
			contentContainer,
		});

		receiptManager.render();
	} catch (error) {
		console.error("Error al crear el nuevo tab:", error);
	}
}

window.ipcRenderer.openFileWindows(handleOpenFileInWindows);

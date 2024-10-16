import { HandleEventManagerEditShipment } from "./EditShipmnet.js";
import { HandleEventManagerEditIDetailItem } from "./EditDetailItem.js";

export class ManagerEditingShipment {
	constructor({ ShipmentOriginal, FileName, Shipment }) {
		this.ShipmentOriginal = ShipmentOriginal;
		this.FileName = FileName;
		this.Shipment = Shipment;
	}

	showUserError(message) {
		alert(message);
		console.error(message);
	}

	async saveFile(type) {
		console.log("Guardando archivo");

		// Crea el contenido XML que deseas guardar
		const xmlContent = await window.fileApi.createXMLFile(
			this.ShipmentOriginal
		);

		// Guarda el archivo
		let result = null;
		const objConfiguration = {
			content: xmlContent,
			fileName: this.FileName,
		};

		if (type === "save-as") {
			result = await window.fileApi.saveFileAs(objConfiguration);
		} else {
			result = await window.fileApi.saveFile(objConfiguration);
		}

		console.log({ result });

		if (result?.success) {
			console.log("Archivo guardado en:", result?.filePath);
		} else {
			console.error("Error al guardar el archivo:", result?.error);
		}
	}

	setEventForSave() {
		const saveBtn = document.querySelector("#save-file-btn");

		if (!saveBtn) {
			return this.logError("No se encontró el botón de #guardar");
		}

		// Configurar el evento del botón en el DOM
		saveBtn.addEventListener("click", () => this.saveFile("save"));

		// Configurar el evento de guardar archivo en el menú
		window.ipcRenderer.saveFileAsEvent(() => this.saveFile("save-as"));
		window.ipcRenderer.saveFileEvent(() => this.saveFile("save"));
	}

	setEventClickInTable() {
		const table = document.querySelector("table tbody");

		if (table) {
			table.addEventListener("click", (e) => {
				const { target } = e;
				console.log(
					"[Manager] : Original:",
					this.ShipmentOriginal?.WMWROOT?.WMWDATA?.[0]?.Shipments?.[0]
						?.Shipment?.[0]
				);

				const eventManager = new HandleEventManagerEditIDetailItem(
					this.Shipment
				);

				console.log("[Manager] : Shipment:", this.Shipment);

				eventManager.handleEventClickInTable(target);
			});
		} else {
			this.logError("[setEventListener]: table is not defined");
		}
	}

	setEvetEditPanelInfoDetail() {
		const buttonsEditContent = Array.from(
			document.querySelectorAll("#container-info .card-container button.icon")
		);

		if (!buttonsEditContent || buttonsEditContent.length === 0) {
			return this.logError(
				"[setEventListener]: buttonsEditContent is not defined"
			);
		}

		const eventManager = new HandleEventManagerEditShipment(this.Shipment);

		buttonsEditContent.forEach((button) => {
			button.addEventListener("click", () =>
				eventManager.handleEventEditPanelInfoDetail(button)
			);
		});
	}

	logError(message) {
		console.error(`Error: ${message}`);
	}

	initEvents() {
		this.setEventForSave();
		this.setEventClickInTable();
		this.setEvetEditPanelInfoDetail();
	}
}

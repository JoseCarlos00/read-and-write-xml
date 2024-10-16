import { HandleEventManagerEditShipmentDetail } from "./EditShipmentDetail.js";
import { HandleEventManagerEditIDetailItem } from "./EditDetailItem.js";

/**
 * Clase principal para gestionar la edición y guardado de detalles de `Shipment`.
 */
export class ManagerEditingShipment {
	constructor({ ShipmentOriginal, FileName, Shipment }) {
		this.ShipmentOriginal = ShipmentOriginal;
		this.FileName = FileName;
		this.Shipment = Shipment;
	}

	/**
	 * Muestra un mensaje de error al usuario.
	 * @param {string} message - Mensaje de error a mostrar.
	 */
	showUserError(message) {
		alert(message);
		console.error(message);
	}

	/**
	 * Guarda el archivo en el sistema, usando el tipo de guardado especificado.
	 * @param {string} type - Tipo de guardado ("save" o "save-as").
	 */
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

	/**
	 * Configura el evento de guardado en el botón de interfaz y en el menú de la aplicación.
	 */
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

	/**
	 * Configura el evento de clic en las filas de la tabla para iniciar la edición.
	 */
	setEventClickInTable() {
		const tbody = document.querySelector("table tbody");

		if (tbody) {
			tbody.addEventListener("click", (e) => {
				const { target } = e;

				// console.log(
				// 	"[Manager] : Original:",
				// 	this.ShipmentOriginal?.WMWROOT?.WMWDATA?.[0]?.Shipments?.[0]
				// 		?.Shipment?.[0]
				// );

				// console.log("[Manager] : Shipment:", this.Shipment);

				const eventManager = new HandleEventManagerEditIDetailItem(
					this.Shipment
				);

				eventManager.handleEventClickInTable(target);
			});
		} else {
			this.logError("[setEventListener]: table is not defined");
		}
	}

	/**
	 * Configura el evento de edición en el panel de detalles de la información.
	 */
	setEvetEditPanelInfoDetail() {
		const buttonsEditContent = Array.from(
			document.querySelectorAll("#container-info .card-container button.icon")
		);

		if (!buttonsEditContent || buttonsEditContent.length === 0) {
			return this.logError(
				"[setEventListener]: buttonsEditContent is not defined"
			);
		}

		// Instancial clase  para manejar eventos de edición en panel de detalles
		const eventManager = new HandleEventManagerEditShipmentDetail(
			this.Shipment
		);

		buttonsEditContent.forEach((button) => {
			button.addEventListener("click", () =>
				eventManager.handleEventEditPanelInfoDetail(button)
			);
		});
	}

	/**
	 * Registra un mensaje de error en la consola.
	 * @param {string} message - Mensaje de error.
	 */
	logError(message) {
		console.error(`Error: ${message}`);
	}

	/**
	 * Inicializa los eventos principales de la clase.
	 * Para  la edición de información y guardado del `Shipment`.

	 */
	initEvents() {
		this.setEventForSave();
		this.setEventClickInTable();
		this.setEvetEditPanelInfoDetail();
	}
}

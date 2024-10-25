import { HandleEventManagerEditShipmentDetail } from "./EditShipmentDetail.js";
import { HandleEventManagerEditIDetailItem } from "./EditDetailItem.js";
import ToastAlert from "../../utils/ToasAlert.js";

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
	}

	/**
	 * Guarda el archivo en el sistema, usando el tipo de guardado especificado.
	 * @param {string} type - Tipo de guardado ("save" o "save-as").
	 */
	async saveFile(type) {
		try {
			console.log("Guardando archivo");

			// Crea el contenido XML que deseas guardar
			const xmlContent = await window.fileApi.createXMLFile(this.ShipmentOriginal);

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

			if (!result?.success) {
				throw new Error("Error  al guardar archivo" + result?.error);
			}

			if (type === "save-as") {
				ToastAlert.showAlertFullTop({ message: `Archivo guardado en: ${result?.filePath}`, type: "success" });
			} else {
				ToastAlert.showAlertFullTop({ message: `Archivo guardado`, type: "success" });
			}
		} catch (error) {
			ToastAlert.showAlertFullTop({ message: "Error al guardar archivo", type: "error" });

			console.error("Error al guardar el archivo:", error.message);
		}
	}

	/**
	 * Configura el evento de guardado en el botón de interfaz y en el menú de la aplicación.
	 */
	setEventForSave() {
		try {
			const saveBtn = document.querySelector("#save-file-btn");
			const saveAsBtn = document.querySelector("#save-file-as-btn");

			if (!saveBtn) {
				return new Error("No se encontró el botón de #guardar");
			}

			if (!saveAsBtn) {
				return new Error("No se encontró el botón de #guardar como");
			}

			// Configurar el evento del botón en el DOM
			saveBtn.addEventListener("click", () => this.saveFile("save"));
			saveAsBtn.addEventListener("click", () => this.saveFile("save-as"));

			// Configurar el evento de guardar archivo en el menú
			window.ipcRenderer.saveFileAsEvent(() => this.saveFile("save-as"));
			window.ipcRenderer.saveFileEvent(() => this.saveFile("save"));
		} catch (error) {
			this.logError("Error al configurar el evento de guardado: " + error.message);
		}
	}

	/**
	 * Configura el evento de clic en las filas de la tabla para iniciar la edición.
	 */
	setEventClickInTable() {
		try {
			const tbody = document.querySelector("table tbody");

			if (!tbody) {
				throw new Error("No se encontró el elemento <tbody> en la tabla");
			}

			const eventManager = new HandleEventManagerEditIDetailItem(this.Shipment);

			// Agregar evento de clic en las filas de la tabla
			tbody.addEventListener("click", (e) => {
				const { target } = e;
				eventManager.handleEventClickInTable(target);
			});
		} catch (error) {
			this.logError("Error al configurar el evento de clic en la tabla: " + error.message);
		}
	}

	/**
	 * Configura el evento de edición en el panel de detalles de la información.
	 */
	setEvetEditPanelInfoDetail() {
		try {
			const buttonsEditContent = Array.from(document.querySelectorAll("#container-info .card-container button.icon"));

			if (!buttonsEditContent || buttonsEditContent.length === 0) {
				throw new Error("No se encontraron los botones de edición en el panel de detalles");
			}

			// Instancial clase  para manejar eventos de edición en panel de detalles
			const eventManager = new HandleEventManagerEditShipmentDetail(this.Shipment);

			buttonsEditContent.forEach((button) => {
				button.addEventListener("click", () => eventManager.handleEventEditPanelInfoDetail(button));
			});
		} catch (error) {
			this.logError("Error al configurar el evento de edición en el panel de detalles: " + error.message);
		}
	}

	/**
	 * Registra un mensaje de error en la consola.
	 * @param {string} message - Mensaje de error.
	 */
	logError(message) {
		console.error(`Detalle del error: ${message}`);
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

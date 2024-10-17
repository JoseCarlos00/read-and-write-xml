import { GetTable } from "./GetTable.js";
import { GetPanelInfo } from "./GetPanelInfo.js";
import { ManagerEditingShipment } from "./edit_content/ManagerEditingShipment.js";

/**
 * Clase para gestionar la creación y renderización de tablas y paneles de información de envíos.
 */
export class ShipmentManager {
	constructor({ Shipment, ShipmentOriginal, FileName }) {
		this.Shipment = Shipment;

		this.ManagerEditingShipment = new ManagerEditingShipment({
			ShipmentOriginal,
			Shipment,
			FileName,
		});

		this.xmlContentContainer = document.getElementById("xml-content");
	}

	/**
	 * Crea una tabla basada en los datos del envío.
	 * @return {HTMLElement|null} Retorna el elemento de la tabla si se crea con éxito, o null si no se encuentra el envío.
	 */
	async createTable() {
		if (!this.Shipment) {
			throw new Error("[createTable]: no se encontró el elemento [Shipment]");
		}

		const table = await GetTable.getTableElement(this.Shipment);
		return table;
	}

	/**
	 * Crea un panel de información basado en los datos del envío.
	 * @return {Promise<void>} Retorna una promesa que se resuelve cuando se completa la creación del panel.
	 */
	async createPanelInfo() {
		if (!this.Shipment) {
			throw new Error(
				"[createPanelInfo]: No se encontró el elemento [Shipment]"
			);
		}

		GetPanelInfo.setPanelInfoDetail(this.Shipment);
	}

	/**
	 * Renderiza la tabla y el panel de información en el contenedor correspondiente.
	 * Inicializa eventos de edición después de la renderización.
	 */
	async render() {
		try {
			const table = await this.createTable();
			await this.createPanelInfo();

			if (!table) {
				this.xmlContentContainer.innerHTML = "";
				throw new Error(
					"[render]: No se pudo obtener el elemento [table] del Shipment"
				);
			}

			this.xmlContentContainer.appendChild(table);

			this.ManagerEditingShipment.initEvents();
		} catch (error) {
			this.logError("Error al renderizar la tabla: " + error.message);
			this.showUserError(
				"Ha ocurrido un error al mostrar la lista de articulos."
			);
		}
	}

	/**
	 * Registra un mensaje de error en la consola.
	 * @param {string} message - Mensaje de error a registrar.
	 */
	logError(message) {
		console.error(`Detalle del error: ${message}`);
	}

	/**
	 * Muestra un mensaje de error al usuario y lo registra en la consola.
	 * @param {string} message - Mensaje de error a mostrar.
	 */
	showUserError(message) {
		alert(message);
	}
}

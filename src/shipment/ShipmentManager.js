import { GetTable } from "./GetTable.js";
import { GetPanelInfo } from "./GetPanelInfo.js";
import { ManagerEditingShipment } from "./edit_content/ManagerEditingShipment.js";

export class ShipmentManager {
	constructor({ Shipment, ShipmentOriginal, FileName }) {
		this.Shipment = Shipment;

		this.ManagerEditingShipment = new ManagerEditingShipment({
			ShipmentOriginal,
			FileName,
		});

		this.xmlContentContainer = document.getElementById("xml-content");
	}

	async createTable() {
		if (!this.Shipment) {
			return this.logError(
				"[createTable]: no se encontró el elemento [Shipment]"
			);
		}

		const table = await GetTable.getTableElement(this.Shipment);
		return table;
	}

	async createPanelInfo() {
		if (!this.Shipment) {
			return this.logError(
				"[createPanelInfo]: no se encontró el elemento [Shipment]"
			);
		}

		await GetPanelInfo.setPanelInfoDetail(this.Shipment);
	}

	async render() {
		const table = await this.createTable();
		await this.createPanelInfo();

		if (table) {
			this.xmlContentContainer.appendChild(table);

			this.ManagerEditingShipment.initEvents();
		}
	}

	logError(message) {
		console.error(`Error: ${message}`);
	}
}

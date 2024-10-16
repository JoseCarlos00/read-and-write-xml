import { ShipmentEditor } from "./ShipmentEditor.js";

export class HandleEventManagerEditIDetailItem {
	constructor(Shipment) {
		this.ShipmentDetails = Shipment?.Details?.[0]?.ShipmentDetail ?? [];
		this.currentRow = null;
		this.currentLineNumber = null;
		this.totalLines = document.querySelector("#totalLines");

		this.deleter = new ShipmentDeleter(this.ShipmentDetails);
	}

	// Se asigna currentRow
	handleEventClickInTable(target) {
		const { nodeName, classList } = target;

		const currentRow = target.closest("tr");

		if (!currentRow) {
			return this.showUserError(
				"Ha ocurrido un error al intentar editar el contenido"
			);
		}

		const currentElement = {
			TD: () => {
				// Verifica que el target tenga la clase "action"
				return classList.contains("action")
					? target.querySelector("svg")
					: null;
			},
			use: () => target.closest("svg"),
			svg: () => target,
		};

		if (!currentElement[nodeName]) {
			return;
		}

		const currentButton = currentElement[nodeName]();

		if (!currentButton) {
			return;
		}

		this.currentRow = currentRow;
		this.handleActionTable(currentButton);
	}

	// Se asigna -> LineNumber
	handleActionTable({ dataset }) {
		const { actionType, lineNumber } = dataset;

		const actions = {
			editRow: () => this.updateRowFields(),
			deleteRow: () => this.deleteRow(),
		};

		const action = actions[actionType];

		if (!action) {
			this.showUserError(`No se puede editar el campo: ${actionType}`);
			return;
		}

		this.currentLineNumber = lineNumber;
		action();
	}

	updateRowFields() {
		const tdItem = this.currentRow.querySelector(".td-item");
		const tdQuantity = this.currentRow.querySelector(".td-quantity");

		if (tdQuantity) {
			new ShipmentEditor(this.ShipmentDetails, this.currentLineNumber).editCell(
				tdQuantity
			);
		}
	}

	deleteRow() {
		if (!this.currentRow) {
			this.showUserError("No hay fila seleccionada para eliminar");
			return;
		}

		this.deleter.deleteRow(this.currentLineNumber);
		this.currentRow.remove();
		this.updateLineNumber();
	}

	updateLineNumber() {
		this.totalLines.textContent = this.ShipmentDetails.length;
	}
}

class ShipmentDeleter {
	constructor(shipmentDetails) {
		this.shipmentDetails = shipmentDetails;

		this.currentLabelQty = null;
	}

	deleteRow(lineNumber) {
		const index = this.getIndex(lineNumber);
		if (index !== -1) {
			this.shipmentDetails.splice(index, 1);
		} else {
			console.warn(
				"No se encontró un objeto con el ErpOrderLineNum especificado."
			);
		}
	}

	getIndex(lineNumber) {
		return this.shipmentDetails.findIndex(
			(detail) => detail?.ErpOrderLineNum?.[0] === lineNumber
		);
	}
}

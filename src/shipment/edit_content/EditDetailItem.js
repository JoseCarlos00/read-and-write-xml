import { ShipmentEditorQuantity, ShipmentEditorItem } from "./ShipmentEditor.js";
import { ShipmentDeleter } from "./ShipmentDeleter.js";

/**
 * Clase que maneja eventos para editar y gestionar detalles de envío.
 * @class
 */
export class HandleEventManagerEditIDetailItem {
	/**
	 * Crea una instancia de HandleEventManagerEditIDetailItem.
	 * @param {Object} Shipment - Objeto que contiene detalles del envío.
	 * @param {HTMLElement} contentContainer - Elemento que el contenido de la `tab` actual.
	 */
	constructor(Shipment, contentContainer) {
		this.ShipmentDetails = Shipment?.Details?.[0]?.ShipmentDetail ?? [];
		this.currentRow = null;
		this.currentLineNumber = null;

		// Se instancia la clase para el manejo de eliminar filas
		this.shipmentDeleter = new ShipmentDeleter(this.ShipmentDetails, contentContainer);

		this.nodeNamesAcepted = ["TD", "use", "svg"];
	}

	/**
	 * Maneja el evento de clic en la tabla para editar el contenido de una celda.
	 * @param {HTMLElement} target - Elemento sobre el que se hizo clic.
	 * @throws {Error} Si no se encuentra la fila o el botón actual.
	 */
	handleEventClickInTable(target) {
		try {
			const { nodeName, classList } = target;

			if (!this.nodeNamesAcepted.includes(nodeName)) return;

			this.currentRow = target?.closest("tr");
			if (!this.currentRow) {
				throw new Error("No se pudo encontrar la fila actual <tr>.");
			}

			const currentElement = {
				TD: () => (classList.contains("action") ? target?.querySelector("svg") : null),
				use: () => target.closest("svg"),
				svg: () => target,
			};

			if (!currentElement?.[nodeName]?.()) {
				return; // No es un tipo de elemento que nos interesa
			}

			const currentButton = currentElement[nodeName]();
			if (!currentButton) {
				throw new Error("No se pudo encontrar el botón actual <svg>.");
			}

			this.handleActionTable(currentButton);
		} catch (error) {
			this.showUserError("Ha ocurrido un problema al intentar editar la celda.");

			console.error("Detalles del error:", error.message);
		}
	}

	/**
	 * Maneja la acción de la tabla según el tipo de acción y número de línea.
	 * @param {Object} dataset - Dataset del elemento que contiene la acción y el número de línea.
	 * @throws {Error} Si la acción no es válida o el número de línea no se puede encontrar.
	 */
	handleActionTable({ dataset }) {
		const { actionType, lineNumber } = dataset;

		const actions = {
			editRow: () => this.updateRowFields(),
			deleteRow: () => this.deleteRow(),
		};

		const action = actions[actionType];

		if (!action) {
			throw new Error(`Acción no válida: ${actionType}`);
		}

		this.currentLineNumber = lineNumber;

		if (!this.currentLineNumber) {
			throw new Error("No se pudo encontrar el número de línea actual.");
		}

		try {
			action();
		} catch (error) {
			this.showUserError(`Ha ocurrido un problema al intentar realizar la acción: ${error.message}`);
			console.error("Detalles del error:", error);
		}
	}

	/**
	 * Actualiza los campos de la fila actual.
	 * Crea una intancia de la clase `ShipmentEditor`
	 * para  manejar la edición de los campos `<td>` editables.

	 */
	updateRowFields() {
		const tdQuantity = this.currentRow?.querySelector(".td-quantity");
		const tdItem = this.currentRow?.querySelector(".td-item");

		if (tdQuantity) {
			try {
				new ShipmentEditorQuantity(this.ShipmentDetails, this.currentLineNumber, tdQuantity).editCell();
			} catch (error) {
				this.showUserError("Ha ocurrido un problema al intentar editar la celda");
				console.error("Detalles del error al editar:", error, message);
			}
		}

		if (tdItem) {
			try {
				new ShipmentEditorItem(this.ShipmentDetails, this.currentLineNumber, tdItem).editCell();
			} catch (error) {
				this.showUserError("Ha ocurrido un problema al intentar editar el item");
				console.error("Detalles del error al editar:", error, message);
			}
		}
	}

	/**
	 * Elimina la fila actual.
	 * @throws {Error} Si no hay fila seleccionada para eliminar.
	 */
	deleteRow() {
		if (!this.currentRow) {
			throw new Error("No hay fila seleccionada para eliminar.");
		}

		try {
			this.shipmentDeleter.deleteRow(this.currentLineNumber);
			this.currentRow.remove();
		} catch (error) {
			this.showUserError("Ha ocurrido un problema al intentar eliminar la fila: ");
			console.error("Detalles del error al eliminar:", error.message);
		}
	}

	/**
	 * Muestra un mensaje de error al usuario.
	 * @param {string} message - Mensaje de error a mostrar.
	 */
	showUserError(message) {
		alert(message);
	}
}

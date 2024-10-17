import { ShipmentEditorQuantity } from "./ShipmentEditor.js";

/**
 * Clase que maneja eventos para editar y gestionar detalles de envío.
 * @class
 */
export class HandleEventManagerEditIDetailItem {
	/**
	 * Crea una instancia de HandleEventManagerEditIDetailItem.
	 * @param {Object} Shipment - Objeto que contiene detalles del envío.
	 */
	constructor(Shipment) {
		this.ShipmentDetails = Shipment?.Details?.[0]?.ShipmentDetail ?? [];
		this.currentRow = null;
		this.currentLineNumber = null;
		this.totalLinesElement = document.querySelector("#totalLines");

		// Se instancia la clase para el manejo de eliminar filas
		this.deleter = new ShipmentDeleter(this.ShipmentDetails);
	}

	/**
	 * Maneja el evento de clic en la tabla para editar el contenido de una celda.
	 * @param {HTMLElement} target - Elemento sobre el que se hizo clic.
	 * @throws {Error} Si no se encuentra la fila o el botón actual.
	 */
	handleEventClickInTable(target) {
		try {
			const { nodeName, classList } = target;

			this.currentRow = target.closest("tr");
			if (!this.currentRow) {
				throw new Error("No se pudo encontrar la fila actual <tr>.");
			}

			const currentElement = {
				TD: () =>
					classList.contains("action") ? target.querySelector("svg") : null,
				use: () => target.closest("svg"),
				svg: () => target,
			};

			if (!currentElement[nodeName]) {
				return; // No es un tipo de elemento que nos interesa
			}

			const currentButton = currentElement[nodeName]();
			if (!currentButton) {
				throw new Error("No se pudo encontrar el botón actual <svg>.");
			}

			this.handleActionTable(currentButton);
		} catch (error) {
			this.showUserError(
				"Ha ocurrido un problema al intentar editar la celda."
			);

			console.error("Detalles del error:", error);
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
			this.showUserError(
				`Ha ocurrido un problema al intentar realizar la acción: ${error.message}`
			);
			console.error("Detalles del error:", error);
		}
	}

	/**
	 * Actualiza los campos de la fila actual.
	 * Crea una intancia de la clase `ShipmentEditor`
	 * para  manejar la edición de los campos `<td>` editables.

	 */
	updateRowFields() {
		const tdQuantity = this.currentRow.querySelector(".td-quantity");

		if (tdQuantity) {
			try {
				new ShipmentEditorQuantity(
					this.ShipmentDetails,
					this.currentLineNumber,
					tdQuantity
				).editCell();
			} catch (error) {
				this.showUserError(
					"Ha ocurrido un problema al intentar editar la celda"
				);
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
			this.deleter.deleteRow(this.currentLineNumber);
			this.currentRow.remove();
			this.updateLineNumber();
		} catch (error) {
			this.showUserError(
				"Ha ocurrido un problema al intentar eliminar la fila: "
			);
			console.error("Detalles del error al eliminar:", error.message);
		}
	}

	/**
	 * Actualiza el número total de líneas en el elemento de totalLines.
	 */
	updateLineNumber() {
		this.totalLinesElement.textContent = this.ShipmentDetails.length;
	}

	/**
	 * Muestra un mensaje de error al usuario.
	 * @param {string} message - Mensaje de error a mostrar.
	 */
	showUserError(message) {
		alert(message);
	}
}

/**
 * Clase que maneja la eliminación de filas en los detalles del envío.
 * @class
 */
class ShipmentDeleter {
	/**
	 * Crea una instancia de ShipmentDeleter.
	 * @param {Array} shipmentDetails - Lista de detalles de envío.
	 */
	constructor(shipmentDetails) {
		this.ShipmentDetails = shipmentDetails;
	}

	/**
	 * Elimina una fila según el número de línea.
	 * @param {number} lineNumber - Número de línea del detalle a eliminar.
	 * @throws {Error} Si no se encuentra un objeto con el ErpOrderLineNum especificado.
	 */
	deleteRow(lineNumber) {
		const index = this.getIndex(lineNumber);
		if (index !== -1) {
			this.ShipmentDetails.splice(index, 1);
		} else {
			throw new Error(
				"No se encontró un objeto con el ErpOrderLineNum especificado."
			);
		}
	}

	/**
	 * Obtiene el índice de un Objeto `item` en `ShipmentDetails` según el número de línea de pedido.
	 * @param {string|number} lineNumber - Número de línea de pedido a buscar.
	 * @returns {number} Índice del detalle en `ShipmentDetails`, o -1 si no se encuentra.
	 * @throws Error si no se encuentra el número de línea.
	 */
	getIndex(lineNumber) {
		const index = this.ShipmentDetails.findIndex(
			(detail) => detail?.ErpOrderLineNum?.[0] === lineNumber
		);

		if (index === -1) {
			throw new Error("Número de línea no encontrado en detalles de envío.");
		}
		return index;
	}
}

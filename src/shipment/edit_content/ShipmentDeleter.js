/**
 * Clase que maneja la eliminación de filas en los detalles del envío.
 * @class
 */
export class ShipmentDeleter {
	/**
	 * Crea una instancia de ShipmentDeleter.
	 * @param {Array} shipmentDetails - Lista de detalles de envío.
	 */
	constructor(shipmentDetails) {
		this.ShipmentDetails = shipmentDetails;
		this.totalLinesElement = document.querySelector("#totalLines");
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
			this.updateLineNumber();
		} else {
			throw new Error("No se encontró un objeto con el ErpOrderLineNum especificado.");
		}
	}

	/**
	 * Obtiene el índice de un Objeto `item` en `ShipmentDetails` según el número de línea de pedido.
	 * @param {string|number} lineNumber - Número de línea de pedido a buscar.
	 * @returns {number} Índice del detalle en `ShipmentDetails`, o -1 si no se encuentra.
	 * @throws Error si no se encuentra el número de línea.
	 */
	getIndex(lineNumber) {
		const index = this.ShipmentDetails.findIndex((detail) => detail?.ErpOrderLineNum?.[0] === lineNumber);

		if (index === -1) {
			throw new Error("Número de línea no encontrado en detalles de envío.");
		}
		return index;
	}

	/**
	 * Actualiza el número total de líneas en el elemento de totalLines.
	 */
	updateLineNumber() {
		this.totalLinesElement.textContent = this.ShipmentDetails.length;
	}
}

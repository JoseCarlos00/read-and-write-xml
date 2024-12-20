import ToasAlert from "../../utils/ToasAlert.js";

/**
 * Clase que maneja la eliminación de filas en los detalles del envío.
 * @class
 */
export class ShipmentDeleter {
	/**
	 * Crea una instancia de ShipmentDeleter.
	 * @param {Array} shipmentDetails - Lista de detalles de envío.
	 * @param {HTMLElement} contentContainer - Elemento que el contenido de la `tab` actual.
	 */
	constructor(shipmentDetails, contentContainer) {
		this.ShipmentDetails = shipmentDetails;
		this.ContentContainer = contentContainer;
		this.totalLinesElement = this.ContentContainer?.querySelector("#totalLines");
		this.deleteRowsButton = this.ContentContainer?.querySelector("#delete-row-btn");

		this.table = this.ContentContainer?.querySelector("#shipmentDetailsTable");

		try {
			if (!this.totalLinesElement || !this.deleteRowsButton || !this.table) {
				throw new Error("[constructor] No se encontraron los elementos necesarios para eliminar filas");
			}

			this.setEventButtonDeleteRows();
		} catch (error) {
			console.error("[ShipmentDeleter]: Error al inicializar ShipmentDeleter:", error);
		}
	}

	/**
	 * Elimina una fila según el número de línea.
	 * @param {number} lineNumber - Número de línea del detalle a eliminar.
	 * @throws {Error} Si no se encuentra un objeto con el ErpOrderLineNum especificado.
	 */
	deleteRow(lineNumber, update = true) {
		const index = this.getIndex(lineNumber);
		if (index !== -1) {
			this.ShipmentDetails.splice(index, 1);

			if (update) {
				this.updateLineNumber();
			}

			/**
			 * * Emitir evento de modificación
			 * ? Solo Si se ha eliminado una fila
			 * ! Se actulizara solo de la pestaña activa
			 */
			window.bridge.modified.emit("modified");
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
		this.messageDeleteRow({ message: "Fila eliminada con éxito.", type: "info", duration: 1500 }); // 2 segundos
	}

	messageDeleteRow(msg) {
		ToasAlert.showAlertRightBottom(msg, "info");
	}

	handleDeleteRows = () => {
		const rowsSelected = Array.from(this.table?.querySelectorAll("tbody tr.selected"));
		if (rowsSelected.length === 0) return;

		const deleteRows = confirm("¿Estás seguro de eliminar todas las líneas del envío?");
		if (!deleteRows) return;

		const isChekedAll = this.ContentContainer?.querySelector(
			'input-checkbox[my-id="selectAll"]'
		)?.shadowRoot?.querySelector("#selectAll")?.checked;

		if (isChekedAll) {
			console.warn("Borrar todas las lineas de envio");
			this.ShipmentDetails.length = 0;
		} else {
			console.warn("Borrar  solo las lineas seleccionadas");
			const lineNumbers = rowsSelected.map((row) => row.dataset.lineNumber);

			if (lineNumbers.length > 0) {
				lineNumbers.forEach((lineNumber) => this.deleteRow(lineNumber, false));
			}
		}

		rowsSelected.forEach((row) => row.remove());
		this.updateLineNumber();
	};

	setEventButtonDeleteRows() {
		if (!this.deleteRowsButton && !this.table) return;
		this.deleteRowsButton.classList.remove("d-none");

		this.deleteRowsButton.removeEventListener("click", this.handleDeleteRows);
		this.deleteRowsButton.addEventListener("click", this.handleDeleteRows);
	}
}

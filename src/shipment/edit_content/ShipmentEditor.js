/**
 * Clase BASE ShipmentEditor para manejar la edición de celdas en detalles de envío.
 */
class ShipmentEditor {
	/**
	 * @param {Array} ShipmentDetails - Lista de detalles de envío.
	 * @param {string|number} currentLineNumber - Número de línea del pedido actual.
	 * @param {HTMLElement} tdElement - Elemento de la celda `td` que se editará.
	 */
	constructor(ShipmentDetails, currentLineNumber, tdElement) {
		this.ShipmentDetails = ShipmentDetails;
		this.currentLineNumber = currentLineNumber;
		this.tdElement = tdElement;
		this.currentLabel = null;
		this.currentInput = null;
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

	/**
	 * Limpia el input de edición y remueve el modo de edición de la celda.
	 */
	clearEventInput = () => {
		this.currentInput.value = "";
		this.tdElement.classList.remove("editing");
		this.currentInput.removeEventListener("keydown", this.handleInputEvents);
		this.currentInput.removeEventListener("blur", this.handleInputEvents);
	};

	/**
	 * Maneja eventos de `blur` y `keydown` para el input de edición.
	 * @param {Event} event - Evento de teclado o desenfoque.
	 */
	handleInputEvents = (event) => {
		const { target: input } = event;
		const { currentValue, updateField } = input.dataset;

		if (event.type === "blur" || event.key === "Enter") {
			const newValue = input.value.trim();

			if (!isNaN(Number(newValue)) && Number(newValue) < 0) {
				return;
			}

			if (newValue === currentValue) {
				this.clearEventInput(input);
				return;
			}

			this.editContent(updateField, newValue);
		}

		if (event.key === "Escape") {
			this.clearEventInput(input);
		}
	};

	/**
	 * Inserta eventos en el input de edición.
	 */
	insertEvent() {
		this.currentInput.addEventListener("blur", this.handleInputEvents);
		this.currentInput.addEventListener("keydown", this.handleInputEvents);
	}

	/**
	 * Edita el contenido de un campo específico en `ShipmentDetails`.
	 * Este método debe ser implementado en las clases derivadas.
	 * @param {string} updateField - Nombre del campo a actualizar.
	 * @param {string|number} newValue - Nuevo valor para el campo.
	 * @throws {Error} Si se llama a este método directamente desde la clase base.
	 */
	editContent = (updateField, newValue) => {
		throw new Error("Este método debe ser implementado en la clase hija.");
	};

	/**
	 * Muestra un mensaje de error al usuario y lo registra en la consola.
	 * @param {string} message - Mensaje de error a mostrar.
	 */
	showUserError(message) {
		alert(message);
	}

	/**
	 * Prepara la celda `td` para la edición, asigna el input y agrega eventos.
	 * Compara el  valor actual con el valor original para determinar si se debe actualizar
	 * y actializa la celda selecionada tambien en el Objeto `Shipment`
	 * Utiliza `try-catch` para capturar errores y mostrar un mensaje único en caso de fallo.
	 */
	editCell() {
		try {
			if (!this.tdElement) {
				throw new Error("No se encontró la celda <td> a editar");
			}

			// Asigna y verifica currentLabel
			this.currentLabel = this.tdElement.querySelector("label");

			if (!this.currentLabel) {
				throw new Error("No se encontró el label en la celda <td>.");
			}

			const currentValue = this.currentLabel.textContent.trim();

			// Asigna y verifica currentInput
			this.currentInput = this.tdElement.querySelector("input");

			if (!this.currentInput) {
				throw new Error("No se encontró el campo de texto para editar");
			}

			// Configuración del input
			this.currentInput.value = currentValue;
			this.currentInput.dataset.currentValue = currentValue;

			this.tdElement.classList.add("editing");

			this.insertEvent();
			this.currentInput.focus();
			this.currentInput.select();
		} catch (error) {
			this.showUserError(
				"Ha ocurrido un problema al intentar editar la celda."
			);

			this.tdElement?.classList?.remove("editing");
			console.error("Detalles del error:", error);
		}
	}
}

export class ShipmentEditorQuantity extends ShipmentEditor {
	constructor(ShipmentDetails, currentLineNumber, tdElement) {
		super(ShipmentDetails, currentLineNumber, tdElement);
	}

	/**
	 * Actuliza el quantity en el objeto `Shipment`: `RequestedQty`, `TotalQuantity` y  `Quantity`

	 * @param {String} newValue valor a actulizar en el Objeto `Shipment`
	 * @param {Number|String} index
	 */
	updateShipmentDetails(newValue, index) {
		this.ShipmentDetails[index].RequestedQty = [newValue];
		this.ShipmentDetails[index].TotalQuantity = [newValue];

		if (this.ShipmentDetails[index]?.SKU?.[0]?.Quantity) {
			this.ShipmentDetails[index].SKU[0].Quantity = [newValue];
		}
	}

	/**
	 * Actualiza el Quantity en `ShipmentDetails` y actualiza la celda de la interfaz.
	 * @param {string|number} newValue - Nuevo valor para la cantidad.
	 * @throws Error si no se puede actualizar el número de línea.
	 */
	editContent = (updateField, newValue) => {
		if (!this.ShipmentDetails || this.ShipmentDetails.length === 0) {
			this.clearEventInput();
			throw new Error("Error en datos de Shipment");
		}

		const index = this.getIndex(this.currentLineNumber);

		if (index === -1) {
			this.clearEventInput();
			throw new Error(
				"No se encontró un objeto con el ErpOrderLineNum especificado."
			);
		}

		console.log("Update:", index, "LINE:", this.currentLineNumber);
		this.updateShipmentDetails(newValue, index);

		this.currentLabel.textContent = newValue;
		this.clearEventInput();

		console.log(this.ShipmentDetails);
	};
}

/**
 * * NOTE: verificar al momento de manejar el click de editar row
 * * si existe  un campo con la clase [.editing] en la fila
 * * si existe quitar la clase y retornar
 * * en caso contrario continuar con el flujo de la funcion
 * 
 * 
 * ? Agregar un toggle class al button  de editar

 */

export class ShipmentEditor {
	constructor(ShipmentDetails, currentLineNumber, tdElement) {
		this.ShipmentDetails = ShipmentDetails;
		this.tdElement = tdElement;
		this.currentLineNumber = currentLineNumber;
		this.currentLabel = null;
		this.currentInput = null;
	}

	getIndex(lineNumber) {
		return this.ShipmentDetails.findIndex(
			(detail) => detail?.ErpOrderLineNum?.[0] === lineNumber
		);
	}

	// Cierra el input y remueve el modo edición
	clearEventInput = () => {
		const { currentInput: input } = this;

		if (!input) return;

		input.value = "";
		input.closest("td")?.classList?.remove("editing");
		input.removeEventListener("keydown", this.handleInputEvents);
		input.removeEventListener("blur", this.handleInputEvents);
	};

	// Maneja eventos de blur y keydown
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

	// Inserta eventos en el input de edición
	insertEvent() {
		const { currentInput: input } = this;

		if (!input) return;

		input.addEventListener("blur", this.handleInputEvents);
		input.addEventListener("keydown", this.handleInputEvents);
	}

	handleEditQuantity(newValue) {
		const { currentLineNumber, ShipmentDetails } = this;
		const index = this.getIndex(currentLineNumber);

		console.log("Update:", index, "LINE:", currentLineNumber);

		// Si se encuentra, actualiza el campo RequestedQty
		if (index !== -1) {
			ShipmentDetails[index].RequestedQty = [newValue];
			ShipmentDetails[index].TotalQuantity = [newValue];

			if (ShipmentDetails[index]?.SKU?.[0]?.Quantity) {
				ShipmentDetails[index].SKU[0].Quantity = [newValue];
			}
		} else {
			console.warn(
				"No se encontró un objeto con el ErpOrderLineNum especificado."
			);
		}

		console.log("New value:", newValue);
		console.log({ ShipmentDetails });

		this.currentLabel.textContent = newValue;
		this.clearEventInput();
	}

	/**
	 * Edita el contenido de un campo específico en `ShipmentDetails`.
	 * @param {string} updateField - Nombre del campo a actualizar.
	 * @param {string|number} newValue - Nuevo valor para el campo.
	 */
	editContent = (updateField, newValue) => {
		if (!this.ShipmentDetails || !this.ShipmentDetails.length === 0) {
			throw new Error("Error en datos de Shipment");
		}

		const fieldMap = {
			quantity: () => this.handleEditQuantity(newValue),
			// Update  other fields from table here
		};

		if (!fieldMap[updateField]) {
			throw new Error(`Campo no editable: ${updateField}`);
		}

		fieldMap[updateField]();
	};

	// Muestra mensajes de error al usuario
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
			const currentLabel = this.tdElement?.querySelector("label");

			if (!currentLabel) {
				throw new Error("No se encontró el label en la celda <td>.");
			}

			this.currentLabel = currentLabel;

			const currentValue = currentLabel.textContent.trim();
			const input = this.tdElement.querySelector("input");

			if (!input) {
				throw new Error("No se encontró el campo de texto para editar");
			}

			this.currentInput = input;

			input.value = currentValue;
			input.dataset.currentValue = currentValue;

			this.tdElement.classList.add("editing");

			this.insertEvent();
			input.focus();
			input.select();
		} catch (error) {
			this.showUserError(
				"Ha ocurrido un problema al intentar editar la celda."
			);
			console.error("Detalles del error:", error);
		}
	}
}

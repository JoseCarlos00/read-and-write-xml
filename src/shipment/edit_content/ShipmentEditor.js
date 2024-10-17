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

	editContent = (updateField, newValue) => {
		if (!this.ShipmentDetails || !this.ShipmentDetails?.length) {
			return this.showUserError("Error en datos de Shipment");
		}

		const fieldMap = {
			quantity: () => this.handleEditQuantity(newValue),
			// Update  other fields from table here
		};

		if (!fieldMap[updateField]) {
			this.showUserError(`No se puede editar el campo: ${updateField}`);
			this.clearEventInput;
			return;
		}

		fieldMap[updateField]();
	};

	// Muestra mensajes de error al usuario
	showUserError(message) {
		alert(message);
		console.error(message);
	}

	// Se asigna -> currentLabelQty
	editCell() {
		const currentLabel = this.tdElement?.querySelector("label");

		if (!currentLabel) {
			return this.showUserError(
				"Mostrar error al usuario\nHa ocurrido un problema al editar el contenido"
			);
		}

		this.currentLabel = currentLabel;

		const currentValue = currentLabel.textContent.trim();
		const input = this.tdElement.querySelector("input");

		if (!input) {
			return this.showUserError("No se encontró el campo de texto para editar");
		}

		this.currentInput = input;

		input.value = currentValue;
		input.dataset.currentValue = currentValue;

		this.tdElement.classList.add("editing");

		this.insertEvent();
		input.focus();
		input.select();
	}
}

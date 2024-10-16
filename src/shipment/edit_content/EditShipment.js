export class HandleEventManagerEditShipment {
	constructor(Shipment) {
		this.Shipment = Shipment;

		this.currentCardContainer = null;
		this.currentLabel = null;
		this.input = null;
		this.currentValue = "";
	}

	// Maneja el evento de edición en el panel de información
	handleEventEditPanelInfoDetail(target) {
		const { updateField } = target.dataset;
		const currentCardContainer = target.closest(".card-container");

		if (!currentCardContainer) {
			return this.showUserError(
				"Ha ocurrido un error al intentar editar el contenido"
			);
		}

		this.currentCardContainer = currentCardContainer;

		const actions = {
			shipmentId: () => this.editShipment(),
			erpOrder: () => this.editShipment(),
		};

		const action = actions[updateField];

		if (action) {
			this.updateField = updateField;
			action();
		} else {
			this.showUserError(`No se puede editar el campo: ${updateField}`);
		}
	}

	// Método principal para editar un campo de Shipment
	editShipment() {
		this.currentLabel =
			this.currentCardContainer.querySelector(".text-for-editing");

		if (!this.currentLabel) {
			return this.showUserError(
				"Ha ocurrido un problema al editar el contenido"
			);
		}

		this.currentCardContainer.classList.add("editing");
		this.currentValue = this.currentLabel.textContent.trim() ?? "";
		this.input = this.currentCardContainer.querySelector("input");

		if (!this.input) {
			return this.showUserError("No se encontró el campo de texto para editar");
		}

		this.input.value = this.currentValue;

		this.insertEvent();
		this.input.focus();
	}

	// Cierra el input y remueve el modo edición
	closeInput = () => {
		this.input.value = "";
		this.currentCardContainer.classList.remove("editing");
		this.input.removeEventListener("keydown", this.handleInputEvents);
		this.input.removeEventListener("blur", this.handleInputEvents);
	};

	// Edita el contenido de Shipment
	editContent = (newValue) => {
		const { Shipment } = this;

		if (!Shipment) return this.showUserError("Error en datos de Shipment");

		const fieldMap = {
			shipmentId: "ShipmentId",
			erpOrder: "ErpOrder",
		};

		const fieldKey = fieldMap[this.updateField];

		if (fieldKey) {
			Shipment[fieldKey] = [newValue];
		} else {
			this.showUserError(`No se puede editar el campo: ${this.updateField}`);
		}

		console.log("New value:", newValue);
		console.log("Modificado desde [Editshioment]:", Shipment);

		this.currentLabel.textContent = newValue;
		this.closeInput();
	};

	// Maneja eventos de blur y keydown
	handleInputEvents = (event) => {
		if (event.type === "blur" || event.key === "Enter") {
			const newValue = this.input.value.trim();

			if (newValue === this.currentValue) this.closeInput();

			this.editContent(newValue);
		}

		if (event.key === "Escape") {
			this.closeInput();
		}
	};

	// Inserta eventos en el input de edición
	insertEvent() {
		this.input.addEventListener("blur", this.handleInputEvents);
		this.input.addEventListener("keydown", this.handleInputEvents);
	}

	// Muestra mensajes de error al usuario
	showUserError(message) {
		alert(message);
		console.error(message);
	}
}

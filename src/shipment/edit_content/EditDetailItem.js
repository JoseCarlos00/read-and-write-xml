export class HandleEventManagerEditIDetailItem {
	constructor(ShipmentOriginal) {
		this.ShipmentOriginal = ShipmentOriginal;

		this.currentCardContainer = null;
		this.currentLabel = null;
		this.input = null;
		this.currentValue = "";
	}

	handleEventClickInTable(target) {
		const { classList, dataset, nodeName } = target;

		console.log(
			this.ShipmentOriginal?.WMWROOT?.WMWDATA?.[0]?.Shipments?.[0]
				?.Shipment?.[0]
		);

		if (classList.contains("edit")) {
			this.editCell(target, dataset?.index);
			return;
		}

		if (classList.contains("delete")) {
			this.deleteCell(target, dataset?.index);
			return;
		}
	}

	editCell(td, index) {
		const currentValue = td.textContent;
		const trCurrent = td.closest("tr");

		// Alerta de deshacer
		if (!trCurrent) {
			alert("Ha ocurrido un error al eliminar la fila");
			return;
		}

		const currentLabel = trCurrent.querySelector("label");

		if (!currentLabel) {
			alert(
				"Mostrar error al usuario\nHa ocurrido un problema al editar el contenido"
			);

			return;
		}

		trCurrent.classList.add("editing");

		const input = trCurrent.querySelector("input.edit-qty");

		if (!input) {
			return this.logError("No se encontró el elemento: [input.edit-qty]");
		}

		const numericIndex = parseInt(index, 10);

		if (typeof numericIndex === "string" || isNaN(numericIndex)) {
			return this.logError("Índice inválido proporcionado a editCell");
		}

		const closeInput = () => {
			input.value = "";

			trCurrent?.classList?.remove("editing");

			input.removeEventListener("keydown", handleKeyDown);
			input.removeEventListener("blur", handleBlur);
		};

		const editConten = (newValue) => {
			const Shipment =
				this.ShipmentOriginal.WMWROOT?.WMWDATA?.[0]?.Shipments?.[0]
					?.Shipment?.[0];

			const ShipmentDetails = Shipment?.Details?.[0]?.ShipmentDetail ?? [];

			// const objectToModify = ShipmentDetails?.[numericIndex];

			if (ShipmentDetails?.[numericIndex]) {
				if (ShipmentDetails?.[numericIndex]?.RequestedQty?.[0]) {
					ShipmentDetails[numericIndex].RequestedQty[0] = newValue;
				}

				if (ShipmentDetails?.[numericIndex]?.TotalQuantity?.[0]) {
					ShipmentDetails[numericIndex].TotalQuantity[0] = newValue;
				}

				if (ShipmentDetails?.[numericIndex]?.SKU?.[0]?.Quantity?.[0]) {
					ShipmentDetails[numericIndex].SKU[0].Quantity[0] = newValue;
				}
			}

			currentLabel.innerHTML = newValue;

			closeInput();
		};

		const handleBlur = () => {
			const newValue = input.value;

			if (newValue === currentValue) {
				return;
			}

			if (isNaN(newValue)) {
				alert("Solo puede ingresar numeros");
				return;
			}

			editConten(newValue);
		};

		const handleKeyDown = ({ key }) => {
			if (key === "Enter") {
				const newValue = input.value;

				if (newValue === currentValue) {
					return;
				}

				if (isNaN(newValue)) {
					alert("Solo puede ingresar numeros");
					return;
				}

				editConten(newValue);
			}

			if (key === "Escape") {
				closeInput();
			}
		};

		input.addEventListener("blur", handleBlur);
		input.addEventListener("keydown", handleKeyDown);

		input.focus(); // Foco en el input
	}

	deleteCell(target, index) {
		const tr = target.closest("tr");

		// Alerta de deshacer
		if (!tr) {
			alert("Ha ocurrido un error al eliminar la fila");
			return;
		}

		const numericIndex = parseInt(index, 10);

		if (typeof numericIndex === "string" || isNaN(numericIndex)) {
			return this.logError("Índice inválido proporcionado a deleteCell");
		}

		const Shipment =
			this.ShipmentOriginal.WMWROOT?.WMWDATA?.[0]?.Shipments?.[0]
				?.Shipment?.[0];

		const ShipmentDetails = Shipment?.Details?.[0]?.ShipmentDetail ?? [];

		// Eliminar el elemento del array
		ShipmentDetails.splice(numericIndex, 1);

		console.dir(this.Shipment?.Details?.[0]);

		tr.remove();
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
		const Shipment =
			this.ShipmentOriginal?.WMWROOT?.WMWDATA?.[0]?.Shipments?.[0]
				?.Shipment?.[0];

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
		console.log({ Shipment });

		this.currentLabel.textContent = newValue;
		this.closeInput();
	};

	// Maneja eventos de blur y keydown
	handleInputEvents = (event) => {
		console.log("[handleInputEvents]", event);

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

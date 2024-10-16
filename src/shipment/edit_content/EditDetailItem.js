export class HandleEventManagerEditIDetailItem {
	constructor(Shipment) {
		this.Shipment = Shipment;

		this.currentRow = null; // -> Value defined en [handleEventClickInTable]
	}

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

	handleActionTable({ dataset }) {
		const { actionType, lineNumber } = dataset;

		console.log(dataset);

		const actions = {
			editRow: () => this.editRow(lineNumber),
			deleteRow: () => console.log("ELIMINAR FILA"),
		};

		const action = actions[actionType];

		if (!action) {
			this.showUserError(`No se puede editar el campo: ${actionType}`);
		}

		action();
	}

	// Método principal para editar los capoos de la tabla
	editRow(lineNumber) {
		// Aquí puedes implementar la lógica para editar la fila

		// const tdItem = this.currentRow.querySelector(".td-item");
		const tdQuantity = this.currentRow.querySelector(".td-quantity");

		if (tdQuantity) {
			this.editCell(tdQuantity, lineNumber);
		}
	}

	editCell(td, lineNumber) {
		const currentLabel = td.querySelector("label");

		if (!currentLabel) {
			return this.showUserError(
				"Mostrar error al usuario\nHa ocurrido un problema al editar el contenido"
			);
		}

		const currentValue = currentLabel.textContent.trim();
		const input = td.querySelector("input");

		if (!input) {
			return this.showUserError("No se encontró el campo de texto para editar");
		}

		input.value = currentValue;
		input.dataset.currentValue = currentValue;

		this.currentRow.classList.add("editing");

		this.insertEvent(input);
		input.focus();

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

	/*
	 REVISAR METODOS
	*/

	// Cierra el input y remueve el modo edición
	closeInput = (input) => {
		input.value = "";
		this.currentRow.classList.remove("editing");
		input.removeEventListener("keydown", this.handleInputEvents);
		input.removeEventListener("blur", this.handleInputEvents);
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
		const { target: input } = event;

		if (event.type === "blur" || event.key === "Enter") {
			const newValue = input.value.trim();
			const currentValue = input.dataset.currentValue;

			if (!isNaN(Number(newValue)) && Number(newValue) < 0) {
				return;
			}

			if (newValue === currentValue) {
				this.closeInput(input);
				return;
			}

			// this.editContent(newValue);
			console.log("EDITAR CONTENIDO en el EVENTO");
		}

		if (event.key === "Escape") {
			this.closeInput(input);
		}
	};

	// Inserta eventos en el input de edición
	insertEvent(input) {
		input.addEventListener("blur", this.handleInputEvents);
		input.addEventListener("keydown", this.handleInputEvents);
	}

	// Muestra mensajes de error al usuario
	showUserError(message) {
		alert(message);
		console.error(message);
	}
}

/**
 * * NOTE: verificar al momento de manejar el click de editar row
 * * si existe  un campo con la clase [.editing] en la fila
 * * si existe quitar la clase y retornar
 * * en caso contrario continuar con el flujo de la funcion
 */

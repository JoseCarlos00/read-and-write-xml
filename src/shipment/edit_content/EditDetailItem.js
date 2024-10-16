export class HandleEventManagerEditIDetailItem {
	constructor(Shipment) {
		this.ShipmentDetails = Shipment?.Details?.[0]?.ShipmentDetail ?? [];

		this.currentRow = null;
		this.currentLineNumber = null;
		this.currentLabelQty = null;
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
			editRow: () => this.editRow(),
			deleteRow: () => console.log("ELIMINAR FILA"),
		};

		const action = actions[actionType];

		if (!action) {
			this.showUserError(`No se puede editar el campo: ${actionType}`);
		}

		action();
		this.currentLineNumber = lineNumber;
	}

	// Método principal para editar los capoos de la tabla
	editRow() {
		// const tdItem = this.currentRow.querySelector(".td-item");
		const tdQuantity = this.currentRow.querySelector(".td-quantity");

		if (tdQuantity) {
			this.editCell(tdQuantity);
		}
	}

	/**
	 * Método para editar un campo de la tabla
	 * Se agregan eventos de  teclado para que el usuario pueda editar el campo
	 *@param {TD} td elemento actual a  editar

	 */
	editCell(td) {
		const currentLabel = td.querySelector("label");

		if (!currentLabel) {
			return this.showUserError(
				"Mostrar error al usuario\nHa ocurrido un problema al editar el contenido"
			);
		}

		this.currentLabelQty = currentLabel;

		const currentValue = currentLabel.textContent.trim();
		const input = td.querySelector("input");

		if (!input) {
			return this.showUserError("No se encontró el campo de texto para editar");
		}

		input.value = currentValue;
		input.dataset.currentValue = currentValue;

		td.classList.add("editing");

		this.insertEvent(input);
		input.focus();
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

	/**
	 * Buscar el índice del objeto con el valor en ErpOrderLineNum que coincide
	 * @param {*} currentLineNumber
	 * @returns  {number}  índice del objeto
	 */
	getIndex(currentLineNumber) {
		return this.ShipmentDetails.findIndex(
			(detail) => detail?.ErpOrderLineNum?.[0] === currentLineNumber
		);
	}

	handleEditQuantity(newValue, clearEventInput) {
		const { currentLineNumber, ShipmentDetails } = this;
		const index = this.getIndex(currentLineNumber);

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

		this.currentLabelQty.textContent = newValue;
		if (typeof clearEventInput === "function") clearEventInput();
	}

	// Cierra el input y remueve el modo edición
	clearEventInput = (input) => {
		if (!input) return;

		input.value = "";
		input.closest("td")?.classList?.remove("editing");
		input.removeEventListener("keydown", this.handleInputEvents);
		input.removeEventListener("blur", this.handleInputEvents);
	};

	/**
	 * Edita el contenido del Objeto Shipment Details por  medio de un input
	 * @param {String} updateField Valor del  campo a actualizar por ejemplo : `quantity` o `item`

	 * @param {String} newValue Valor obtenido del imput
	 */
	editContent = (updateField, newValue, clearEventInput) => {
		if (!this.ShipmentDetails || !this.ShipmentDetails?.length) {
			return this.showUserError("Error en datos de Shipment");
		}

		const fieldMap = {
			quantity: () => this.handleEditQuantity(newValue, clearEventInput),
		};

		if (!fieldMap[updateField]) {
			this.showUserError(`No se puede editar el campo: ${updateField}`);
			if (typeof clearEventInput === "function") clearEventInput();
			return;
		}

		fieldMap[updateField]();
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

			this.editContent(updateField, newValue, () => {
				this.clearEventInput(input);
			});
		}

		if (event.key === "Escape") {
			this.clearEventInput(input);
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
 * 
 * 
 * ? Agregar un toggle class al button  de editar

 */

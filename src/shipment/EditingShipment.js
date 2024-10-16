export class EditingShipment {
	constructor({ ShipmentOriginal, FileName }) {
		this.ShipmentOriginal = ShipmentOriginal;
		this.FileName = FileName;
	}

	handleEventEditPanelInfoDetail({ classList, dataset, nodeName }) {
		console.log("classList:", classList);
		console.log("dataset:", dataset);
		console.log("nodeName:", nodeName);

		if (nodeName === "SPAN" && classList.contains("edit")) {
			this.editShipment(target, dataset?.isElemet);
		}
	}

	handleEventClickInTable(target) {
		const { classList, dataset, nodeName } = target;

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

	editShipment(span, isElemet) {
		const row = span.closest(".row");

		// Alerta de deshacer
		if (!row) {
			alert("Ha ocurrido un error al eliminar la fila");
			return;
		}

		const currentLabel = row.querySelector(".text-for-editing");

		if (!currentLabel) {
			alert(
				"Mostrar error al usuario\nHa ocurrido un problema al editar el contenido"
			);

			return;
		}

		row.classList.add("editing");

		const currentValue = currentLabel.textContent;
		const input = row.querySelector("input");

		input.value = currentValue;

		const closeInput = () => {
			input.value = "";

			row?.classList?.remove("editing");

			input.removeEventListener("keydown", handleKeyDown);
			input.removeEventListener("blur", handleBlur);
		};

		const editConten = (newValue) => {
			const Shipment =
				this.ShipmentOriginal.WMWROOT?.WMWDATA?.[0]?.Shipments?.[0]
					?.Shipment?.[0];

			if (isElemet === "shipmentId") {
				if (Shipment?.ShipmentId?.[0]) {
					Shipment.ShipmentId[0] = newValue;
				} else {
					Shipment.ShipmentId = [newValue];
				}
			} else if (isElemet === "erpOrder") {
				if (Shipment?.ErpOrder?.[0]) {
					Shipment.ErpOrder[0] = newValue;
				} else {
					Shipment.ErpOrder = [newValue];
				}
			}

			console.log("New vaule:", newValue);
			console.log({ Shipment });

			currentLabel.innerHTML = newValue;
			closeInput();
		};

		const handleBlur = () => {
			const newValue = input.value;

			if (newValue === currentValue) {
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

	async saveFile(type) {
		console.log("Guardando archivo");

		// Crea el contenido XML que deseas guardar
		const xmlContent = await window.fileApi.createXMLFile(
			this.ShipmentOriginal
		);

		// Guarda el archivo
		let result = null;
		const objConfiguration = {
			content: xmlContent,
			fileName: this.FileName,
		};

		if (type === "save-as") {
			result = await window.fileApi.saveFileAs(objConfiguration);
		} else {
			result = await window.fileApi.saveFile(objConfiguration);
		}

		console.log({ result });

		if (result?.success) {
			console.log("Archivo guardado en:", result?.filePath);
		} else {
			console.error("Error al guardar el archivo:", result?.error);
		}
	}

	setEventForSave() {
		const saveBtn = document.querySelector("#save-file-btn");

		if (!saveBtn) {
			return this.logError("No se encontró el botón de #guardar");
		}

		// Configurar el evento del botón en el DOM
		saveBtn.addEventListener("click", () => this.saveFile("save"));

		// Configurar el evento de guardar archivo en el menú
		window.ipcRenderer.saveFileAsEvent(() => this.saveFile("save-as"));
		window.ipcRenderer.saveFileEvent(() => this.saveFile("save"));
	}

	setEventClickInTable() {
		const table = document.querySelector("table tbody");

		if (table) {
			table.addEventListener("click", (e) => {
				const { target } = e;
				this.handleEventClickInTable(target);
			});
		} else {
			this.logError("[setEventListener]: table is not defined");
		}
	}

	setEvetEditPanelInfoDetail() {
		const buttonsEditContent = [
			...document.querySelectorAll(
				"#container-info .card-container button.icon"
			),
		];

		if (!buttonsEditContent) {
			this.logError("[setEventListener]: containerInfo is not defined");
		}

		if (buttonsEditContent.length === 0) {
			return this.logError(
				"[setEventListener]: buttonsEditContent is not defined"
			);
		}

		buttonsEditContent.forEach((button) => {
			button.addEventListener("click", () =>
				this.handleEventEditPanelInfoDetail(button)
			);
		});
	}

	logError(message) {
		console.error(`Error: ${message}`);
	}

	initEvents() {
		this.setEventForSave();
		this.setEventClickInTable();
		this.setEvetEditPanelInfoDetail();
	}
}

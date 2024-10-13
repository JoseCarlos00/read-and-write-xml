import { GetTable } from "./GetTable.js";
import { GetPanelInfo } from "./GetPanelInfo.js";

export class Shipment {
	constructor({ Shipment, Original, FileName }) {
		this.ShipmentOriginal = Original;
		this.Shipment = Shipment;
		this.FileName = FileName;

		this.setEventForSave();
	}

	async createTable() {
		if (!this.Shipment) {
			return this.logError(
				"[createTable]: no se encontró el elemento [Shipment]"
			);
		}

		const table = await GetTable.getTableElement(this.Shipment);
		return table;
	}

	async createPanelInfo() {
		if (!this.Shipment) {
			return this.logError(
				"[createPanelInfo]: no se encontró el elemento [Shipment]"
			);
		}

		const infoPanelDetail = await GetPanelInfo.getPanelInfoDetail(
			this.Shipment
		);
		return infoPanelDetail;
	}

	setEventListener() {
		const table = document.querySelector("table tbody");

		if (table) {
			table.addEventListener("click", (e) => {
				const { target } = e;
				this.handleEvetClick(target);
			});
		} else {
			this.logError("[setEventListener]: table is not defined");
		}
	}

	handleEvetClick(target) {
		const { classList, dataset, nodeName } = target;

		if (classList.contains("edit")) {
			const tr = target.closest("tr");
			tr?.classList?.add("editing");
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
		const label = trCurrent.querySelector("label");
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

			console.log("New vaule:", newValue);
			console.log(ShipmentDetails?.[numericIndex]);

			label.innerHTML = newValue;

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

	setEventForSave() {
		const saveBtn = document.querySelector("#save-file-btn");

		if (!saveBtn) {
			return this.logError("No se encontró el botón de #guardar");
		}

		saveBtn.addEventListener("click", async () => {
			console.log("Guardando archivo");

			// Crea el contenido XML que deseas guardar
			const xmlContent = await window.fileApi.createXMLFile(
				this.ShipmentOriginal
			);

			// Guarda el archivo
			const result = await window.fileApi.saveFile({
				content: xmlContent,
				fileName: this.FileName,
			});

			if (result?.success) {
				console.log("Archivo guardado en:", result?.filePath);
			} else {
				console.error("Error al guardar el archivo:", result?.error);
			}
		});
	}

	logError(message) {
		console.error(`Error: ${message}`);
	}
}

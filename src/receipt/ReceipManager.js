import { GetTable } from "./GetTable.js";
import { ManagerEditingReceipt } from "./edit_content/ManagerEditingReceipt.js";

export class ReceiptManager {
	constructor({ Receipt, ReceiptOriginal, FileName, FilePath, contentContainer }) {
		this.Receipt = Receipt;
		this.FileName = FileName;
		this.contentContainer = contentContainer;
		this.warehouse = Receipt?.Warehouse?.[0] ?? "";
		this.ContainersIdParent = Receipt?.ParentContainers?.[0]?.Parent
			? Array.from(Receipt.ParentContainers[0].Parent)
					.map(({ ContainerId }) => ContainerId?.[0] ?? "")
					.join(" | ")
			: "No encontrado";
		this.ReceiptOriginal = ReceiptOriginal;

		this.ManagerEditingReceipt = new ManagerEditingReceipt({
			ReceiptOriginal,
			Receipt,
			FileName,
			FilePath,
			contentContainer,
		});
	}

	/**
	 * Crea un panel de información basado en los datos del envío.
	 * @return {Promise<void>} Retorna una promesa que se resuelve cuando se completa la creación del panel.
	 */
	async createPanelInfo() {
		if (!this.Receipt) {
			throw new Error("[createPanelInfo]: No se encontró el elemento [Shipment]");
		}

		const selected = (warehouse) => (this.warehouse === warehouse ? "selected" : "");

		console.log("selected:", selected());

		const div = document.createElement("div");
		div.className = "receipt-panel";
		div.innerHTML = /*html*/ `
				<label >Containers ID: <span>${this.ContainersIdParent}</span></label>
        <form class="form-warehouse">
          <label for="Warehouse">Warehouse:</label>

          <select name="whs" id="Warehouse">
            <option value="" ${selected()}>No encontrado</option>
            <option value="Mariano" ${selected("Mariano")}>Mariano</option>
            <option value="Tultitlan" ${selected("Tultitlan")}>Tultitlan</option>
          </select>

          <button type="submit">Cambiar</button>
        </form>

    `;

		return div;
	}

	/**
	 * Crea una tabla basada en los datos del envío.
	 * @return {HTMLElement|null} Retorna el elemento de la tabla si se crea con éxito, o null si no se encuentra el envío.
	 */
	async createTable() {
		if (!this.Receipt) {
			throw new Error("[createTable]: no se encontró el elemento [Shipment]");
		}

		return await GetTable.getTableElement(this.Receipt);
	}

	/**
	 * Renderiza la tabla y el panel de información en el contenedor correspondiente.
	 * Inicializa eventos de edición después de la renderización.
	 */
	async render() {
		try {
			const table = await this.createTable();
			const panelInfo = await this.createPanelInfo();

			if (!table) {
				throw new Error("[render]: No se pudo obtener el elemento [table] del Shipment");
			}

			if (!panelInfo) {
				throw new Error("[render]: No se pudo obtener el panel de informacion");
			}

			const tableContainer = document.createElement("div");
			tableContainer.classList.add("table-container");

			const deleteRowContainer = document.createElement("div");
			deleteRowContainer.classList.add("delete-row-container");
			deleteRowContainer.innerHTML = /*html*/ `
				<button id="delete-row-btn" class="button btn-delete-row d-none">
					<svg aria-hidden="true" width="30" height="30">
						<use href="./src/icon/icons.svg#trash"></use>
					</svg>
					<span>Eliminar filas</span>
				</button>

				<label>
					Total lines: <strong id="totalLines">${
						this.Receipt.Details?.[0]?.ReceiptDetail?.length ?? ""
					}</strong>, <small>Order By Item</small>
				</label>
			`;

			this.contentContainer.appendChild(panelInfo);
			tableContainer.appendChild(deleteRowContainer);
			tableContainer.appendChild(table);

			this.contentContainer.appendChild(tableContainer);

			this.ManagerEditingReceipt.initEvents();
			this.setEventChangeWarehose();
		} catch (error) {
			this.logError("Error al renderizar la tabla: " + error.message);
			this.showUserError("Ha ocurrido un error al mostrar la lista de articulos.");
		}
	}

	setEventChangeWarehose() {
		try {
			const formChanfeWarehose = this.contentContainer?.querySelector(".form-warehouse");

			if (!formChanfeWarehose) {
				throw new Error("[setEventChangeWarehose]: No se encotro el formulario .form-warehouse");
			}

			formChanfeWarehose.addEventListener("submit", (e) => {
				e.preventDefault();
				const warehouse = formChanfeWarehose.whs.value;

				if (this.warehouse === warehouse) {
					return;
				}

				this.changeWarehouse(warehouse);
			});
		} catch (error) {
			console.error("Error: [setEventChangeWarehose] ", error);
		}
	}

	changeWarehouse(warehouse) {
		if (!warehouse) {
			throw new Error("[changeWarehouse]: No se proporciono el almacen");
		}

		const ReceiptContainers = Array.from(this.Receipt?.ParentContainers?.[0]?.Parent) ?? [];

		if (ReceiptContainers.length === 0) {
			throw new Error("[changeWarehouse]: No se encontraron ReceiptContainer");
		}

		if (!this.Receipt?.Warehouse) {
			throw new Error("[changeWarehouse]: No se encontró el warehouse");
		}

		ReceiptContainers.forEach((receipt) => {
			const receiptContainers = Array.from(receipt?.ReceiptContainers?.[0]?.ReceiptContainer ?? []);

			if (receiptContainers.length > 0) {
				receiptContainers.forEach(({ FromWhs }) => {
					if (FromWhs[0]) {
						FromWhs[0] = warehouse;
					} else {
						throw new Error("Error: al actualizar el warehouse");
					}
				});
			} else {
				throw new Error("Error: al actualizar el warehouse");
			}
		});

		this.Receipt.Warehouse = [warehouse];
		this.warehouse = warehouse;

		/**
		 * * Emitir evento de modificación
		 * ? Solo Si se ha cambiado el warehose
		 * ! Se actulizara solo de la pestaña activa
		 */
		window.bridge.modified.emit("modified");
	}

	/**
	 * Registra un mensaje de error en la consola.
	 * @param {string} message - Mensaje de error a registrar.
	 */
	logError(message) {
		console.error(`Detalle del error: ${message}`);
	}

	/**
	 * Muestra un mensaje de error al usuario y lo registra en la consola.
	 * @param {string} message - Mensaje de error a mostrar.
	 */
	showUserError(message) {
		alert(message);
	}
}

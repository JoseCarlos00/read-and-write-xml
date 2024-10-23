/**
 * Clase para gestionar la creación y renderización
 * de una tabla basada en los detalles del `Shipment`.
 */
export class GetTable {
	constructor(Shipment) {
		this.ShipmentDetails = Shipment.Details?.[0]?.ShipmentDetail ?? [];
	}

	/**
	 * Obtiene el total de líneas del `Shipment`.
	 * @return {number} Número total de líneas en ShipmentDetails.
	 */
	get totalLines() {
		return this.ShipmentDetails.length;
	}

	/**
	 * Genera y retorna el elemento `<thead>` de la tabla.
	 * @return {HTMLElement} El elemento thead para la tabla.
	 */
	getThead() {
		const thead = document.createElement("thead");
		thead.innerHTML = /*html*/ `
				<tr>
					<th class="select-all">
						<input-checkbox my-id="selectAll"></input-checkbox>
						<span>All</span>
					</th>
					<th>Item</th>
					<th>Quantity</th>
					<th>Line Number</th>
					<th>Edit</th>
					<th>Delete</th>
				</tr>
    `;

		return thead;
	}

	/**
	 * Genera y retorna el elemento `<tbody>` de la tabla con filas basadas en los detalles del `Shipment`.
	 * @return {HTMLElement} El elemento tbody para la tabla.
	 */
	async getTbody() {
		if (this.ShipmentDetails.length === 0) {
			console.error("No se encontró el elemento ShipmentDetails");
			return;
		}

		// Ordenar ShipmentDetails por el Item
		const sortedDetails = this.ShipmentDetails.sort((a, b) => {
			const itemA = a.SKU?.[0]?.Item?.[0] || "";
			const itemB = b.SKU?.[0]?.Item?.[0] || "";

			return itemA.localeCompare(itemB);
		});

		const tbody = document.createElement("tbody");

		sortedDetails.forEach(({ SKU, ErpOrderLineNum }) => {
			if (!SKU || SKU.length === 0) {
				console.warn("SKU no tiene datos para una fila");
				return;
			}

			const { Item, Quantity } = SKU[0];
			const tr = document.createElement("tr");
			tr.dataset["lineNumber"] = ErpOrderLineNum;

			//  Crear elementos TD
			const tdCheckbox = document.createElement("td");
			const tdItem = document.createElement("td");
			const tdQuantity = document.createElement("td");
			const tdErpOrderLineNum = document.createElement("td");
			const tdEditRow = document.createElement("td");
			const tdDeleteRow = document.createElement("td");

			// Contendido de elementos TD

			// CHECKBOX -> Select Row
			tdCheckbox.innerHTML = `<input-checkbox></input-checkbox>`;

			// ITEM
			tdItem.textContent = Item;
			tdItem.classList.add("td-item");

			//  QUANTITY
			tdQuantity.innerHTML = `
				<label>${Quantity}</label>
				<input class="edit-qty" type="number" min="1" value="" data-update-field="quantity" data-current-value="">
				`;
			tdQuantity.dataset["lineNumber"] = ErpOrderLineNum;
			tdQuantity.classList.add("quantity", "td-quantity");

			// LINE NUMBER
			tdErpOrderLineNum.textContent = ErpOrderLineNum;

			// EDIT
			tdEditRow.classList.add("position-relative", "action");
			tdEditRow.innerHTML = `
				<svg class="icon icon-table"  data-action-type="editRow" data-line-number="${ErpOrderLineNum}" >

					<use href="src/icon/icons.svg#pencil"></use>
				</svg>`;

			// DELEYE
			tdDeleteRow.classList.add("position-relative", "action");
			tdDeleteRow.innerHTML = `
					<svg class="icon icon-table"  data-action-type="deleteRow" data-line-number="${ErpOrderLineNum}" >
>
						<use href="src/icon/icons.svg#delete-fill"></use>
					</svg>`;

			// Insertar Contenidos  TD en la fila
			tr.append(tdCheckbox, tdItem, tdQuantity, tdErpOrderLineNum, tdEditRow, tdDeleteRow);

			tbody.appendChild(tr);
		});

		return tbody;
	}

	/**
	 * Crea una instancia de GetTable, construye el elemento de la tabla y lo retorna.
	 * @param {Object} shipment - Objeto de envío con detalles de `Shipment`.
	 * @return {HTMLElement|null} La tabla generada o null si no hay datos de envío.
	 */
	static async getTableElement(shipment) {
		if (!shipment) {
			return null;
		}

		const getTable = new GetTable(shipment);

		const caption = document.createElement("caption");
		caption.innerHTML = `Total lines: <strong id="totalLines">${
			getTable.totalLines ?? ""
		}</strong>, <small>Order By Item</small>`;

		const table = document.createElement("table");
		table.id = "shipmentDetailsTable";

		table.appendChild(caption);
		table.appendChild(getTable.getThead());
		table.appendChild(await getTable.getTbody());

		return table;
	}
}

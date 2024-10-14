export class GetTable {
	constructor(Shipment) {
		this.ShipmentDetails = Shipment.Details?.[0]?.ShipmentDetail ?? [];
	}

	get totalLines() {
		return this.ShipmentDetails.length;
	}

	getThead() {
		const thead = document.createElement("thead");
		thead.innerHTML = /*html*/ `
				<tr>
					<th>No</th>
					<th>Item</th>
					<th>Quantity</th>
					<th>Line Number</th>
					<th>Edit</th>
					<th>Delete</th>
					<th>Lock</th>
				</tr>
    `;

		return thead;
	}

	async insertDataSetIndexOriginal() {
		tdQuantity.dataset["index"] = index;
	}

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

		sortedDetails.forEach(({ SKU, ErpOrderLineNum }, index) => {
			if (!SKU || SKU.length === 0) {
				console.warn("SKU no tiene datos para una fila");
				return;
			}

			const { Item, Quantity } = SKU?.[0];
			const tr = document.createElement("tr");

			const tdEmpty = document.createElement("td");
			const tdItem = document.createElement("td");
			const tdQuantity = document.createElement("td");
			const tdErpOrderLineNum = document.createElement("td");
			const tdEditRow = document.createElement("td");
			const tdDeleteRow = document.createElement("td");
			const tdLock = document.createElement("td");

			tdEmpty.textContent = index + 1;
			tdItem.textContent = Item;

			tdQuantity.innerHTML = `<label>${Quantity}</label><input class="edit-qty" type="number" min="1" value="">`;
			tdQuantity.setAttribute("align", "center");
			tdQuantity.dataset["index"] = index;
			tdQuantity.classList.add("quantity");

			tdErpOrderLineNum.textContent = ErpOrderLineNum;
			tdEditRow.classList.add("edit");
			tdEditRow.dataset["index"] = index;
			tdDeleteRow.classList.add("delete");
			tdDeleteRow.dataset["index"] = index;
			tdLock.className = "lock open";
			tdLock.dataset["index"] = index;

			tr.appendChild(tdEmpty);
			tr.appendChild(tdItem);
			tr.appendChild(tdQuantity);
			tr.appendChild(tdErpOrderLineNum);
			tr.appendChild(tdEditRow);
			tr.appendChild(tdDeleteRow);
			tr.appendChild(tdLock);

			tbody.appendChild(tr);
		});

		return tbody;
	}

	static async getTableElement(shipment) {
		if (!shipment) {
			return null;
		}

		const getTable = new GetTable(shipment);

		const caption = document.createElement("caption");
		caption.innerHTML = `Total: <strong>${
			getTable.totalLines ?? ""
		}</strong>, <small>Ordenada por Item</small>`;

		const table = document.createElement("table");

		table.appendChild(caption);
		table.appendChild(getTable.getThead());
		table.appendChild(await getTable.getTbody());

		return table;
	}
}

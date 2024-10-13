export class GetPanelInfo {
	constructor(Shipment) {
		this.Shipment = Shipment ?? [];
	}

	#createPanelCustomer() {
		const customerElement = document.createElement("div");
		customerElement.className = "customer-container";

		const divTittle = document.createElement("div");
		divTittle.innerHTML = `<div class="info-title"><strong>Customer</strong></div>`;

		customerElement.appendChild(divTittle);

		const panelCustomer = this.Shipment?.Customer?.[0];

		if (!panelCustomer) {
			return null;
		}

		const customer = panelCustomer?.Customer?.[0] ?? "";
		this.#insertRow({
			element: this.#getRow({ title: "Customer", value: customer }),
			container: customerElement,
		});

		const customerName = panelCustomer?.CustomerAddress?.[0]?.Name?.[0] ?? "";
		this.#insertRow({
			element: this.#getRow({ title: "Customer Name", value: customerName }),
			container: customerElement,
		});

		return customerElement;
	}

	#createPanelShipTo() {
		const shipToElement = document.createElement("div");
		shipToElement.className = "ship-to-container";

		const divTittle = document.createElement("div");
		divTittle.innerHTML = `<div class="info-title"><strong>Ship To Address</strong></div>`;

		shipToElement.appendChild(divTittle);

		const panelCustomer = this.Shipment?.Customer?.[0];

		if (!panelCustomer) {
			return null;
		}

		const shipTo = panelCustomer?.ShipTo?.[0] ?? "";
		this.#insertRow({
			element: this.#getRow({ title: "Ship To", value: shipTo }),
			container: shipToElement,
		});

		const shipToName = panelCustomer?.ShipToAddress?.[0]?.Name?.[0] ?? "";
		this.#insertRow({
			element: this.#getRow({ title: "Name", value: shipToName }),
			container: shipToElement,
		});

		const address =
			panelCustomer?.ShipToAddress?.[0]?.Address1?.[0] +
			", " +
			panelCustomer?.ShipToAddress?.[0]?.City?.[0];

		this.#insertRow({
			element: this.#getRow({ title: "Address", value: address }),
			container: shipToElement,
		});

		return shipToElement;
	}

	#getRow({ title, value }) {
		const row = document.createElement("div");
		row.classList.add("row");

		row.innerHTML = /*html*/ `
      <strong>${title}:</strong>
      <span>${value}</span>
    `;

		return row;
	}

	#insertRow({ element, container }) {
		if (container && element) {
			container.appendChild(element);
		} else {
			console.error("No es un elemento valido a insertar");
		}
	}

	async createPanelInfoDetail() {
		if (!this.Shipment) {
			console.error("No se encontro el elemento Shipment ");
			return null;
		}

		const container = document.createElement("div");
		container.className = "container";

		const shipmentId = this.Shipment?.ShipmentId?.[0] ?? "";
		this.#insertRow({
			element: this.#getRow({ title: "Shipment Id", value: shipmentId }),
			container,
		});

		const erpOrder = this.Shipment?.ErpOrder?.[0] ?? "";
		this.#insertRow({
			element: this.#getRow({ title: "Erp Order", value: erpOrder }),
			container,
		});

		const customerPanel = this.#createPanelCustomer();
		this.#insertRow({
			element: customerPanel,
			container,
		});

		const shitToPanel = this.#createPanelShipTo();
		this.#insertRow({
			element: shitToPanel,
			container,
		});

		const comments =
			this.Shipment?.Comments?.[0]?.Comment?.[0]?.Text?.[0] ?? "";

		const rowElemet = this.#getRow({ title: "Comments", value: comments });
		if (rowElemet) {
			rowElemet.classList.add("mt1");

			this.#insertRow({
				element: rowElemet,
				container,
			});
		}

		return container;
	}

	static async getPanelInfoDetail(Shipment) {
		if (!Shipment) {
			return null;
		}

		const panelInfo = new GetPanelInfo(Shipment);

		return await panelInfo.createPanelInfoDetail();
	}
}

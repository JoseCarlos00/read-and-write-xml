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

	#getRowIcon({ title, value, iconCLass, dataSetIsElement }) {
		const row = document.createElement("div");
		row.classList.add("row");

		row.innerHTML = /*html*/ `
			<strong class="position-relative">
				<label>${title}:</label>
				<span class="icon ${iconCLass}" data-is-elemet=${dataSetIsElement}></span
			>
			</strong>
      <div>
				<span class="text-for-editing">${value}</span>
				<input type="text">
			</div>
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

	/**
	 * Retorna un elemeto con la informacion del `shiptment` actual
	 * @returns {HTMLDivElement}
	 */
	async createPanelInfoDetail() {
		if (!this.Shipment) {
			console.error("No se encontro el elemento Shipment ");
			return null;
		}

		const container = document.createElement("div");
		container.className = "container container-info";

		const shipmentId = this.Shipment?.ShipmentId?.[0] ?? "";
		this.#insertRow({
			element: this.#getRowIcon({
				title: "Shipment Id",
				value: shipmentId,
				iconCLass: "edit",
				dataSetIsElement: "shipmentId",
			}),
			container,
		});

		const erpOrder = this.Shipment?.ErpOrder?.[0] ?? "";
		this.#insertRow({
			element: this.#getRowIcon({
				title: "Erp Order",
				value: erpOrder,
				iconCLass: "edit",
				dataSetIsElement: "erpOrder",
			}),
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

class Card {
	constructor({ titleHeader = "No disponible", bodyContent = [] }) {
		this.titleHeader = titleHeader;
		this.bodyContent = bodyContent;

		this.cardContainer = document.createElement("div");
		this.cardContainer.classList.add("card-container");
	}

	createHeader() {
		const header = document.createElement("header");

		const title = document.createElement("h3");
		title.className = "card-title mb-02";
		title.textContent = this.titleHeader + ":";

		header.appendChild(title);
		return header;
	}

	createFooter() {
		const footer = document.createElement("footer");
		footer.className = "card-footer";

		return footer;
	}

	createBodyChild(title, content) {
		const child = document.createElement("div");
		child.className = "mb-3";

		const childContent = document.createElement("p");
		childContent.className = "pr-6 mb-0";
		childContent.innerHTML = `
			<spam class="info-title">${title}:</spam>
			<span class="value-of">${content}</span>
			`;

		child.appendChild(childContent);
		return child;
	}

	createBody() {
		const body = document.createElement("div");
		body.classList.add("card-body");

		if (this.bodyContent.length === 0) {
			const emptyMessage = this.createBodyChild(
				"",
				"No information available."
			);
			body.appendChild(emptyMessage);

			return body;
		}

		this.bodyContent.forEach(({ title, value }) => {
			const child = this.createBodyChild(title, value);
			body.appendChild(child);
		});

		return body;
	}

	render() {
		const card = this.cardContainer;

		const header = this.createHeader();
		const body = this.createBody();
		const footer = this.createFooter();

		card.appendChild(header);
		card.appendChild(body);
		card.appendChild(footer);

		const cardContainer = document.querySelector("#container-info");

		if (!cardContainer) {
			alert("Ha ocurido un error al crear el panel de informacion");
			return;
		}

		cardContainer.appendChild(card);
	}
}

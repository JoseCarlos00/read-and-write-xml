import { Card, CardEditData } from "./Card.js";

export class GetPanelInfo {
	constructor(Shipment) {
		this.Shipment = Shipment ?? [];
		this.cardContainer = document.querySelector("#container-info");
	}

	#createPanelCustomer() {
		const objCustomer = this.Shipment?.Customer?.[0];
		if (!objCustomer) {
			return null;
		}

		const customerValue = objCustomer?.Customer?.[0] ?? "";
		const customerNameValue =
			objCustomer?.CustomerAddress?.[0]?.Name?.[0] ?? "";
		const UserDef8 = this.Shipment?.UserDef8?.[0] ?? "";

		const cardCustomer = new Card({
			titleHeader: "Customer",
			bodyContent: [
				{
					title: "Customer:",
					content: customerValue,
				},
				{
					title: "Customer Address:",
					content: customerNameValue,
				},
				{
					title: "Client Number:",
					content: UserDef8,
				},
			],
		});

		cardCustomer.render();
	}

	#createPanelShipTo() {
		const objCustomer = this.Shipment?.Customer?.[0];
		if (!objCustomer) {
			return null;
		}

		const shipTo = objCustomer?.ShipTo?.[0] ?? "";
		const shipToName = objCustomer?.ShipToAddress?.[0]?.Name?.[0] ?? "";
		const address =
			objCustomer?.ShipToAddress?.[0]?.Address1?.[0] +
			", " +
			objCustomer?.ShipToAddress?.[0]?.City?.[0];

		const cardShipTo = new Card({
			titleHeader: "Ship To Address",
			bodyContent: [
				{
					title: "Ship To:",
					content: shipTo,
				},
				{
					title: "Name:",
					content: shipToName,
				},
				{
					title: "Address:",
					content: address,
				},
			],
		});

		cardShipTo.render();
	}

	#createPanelOrderDetail() {
		const { Shipment } = this;

		const orderDate = Shipment?.OrderDate?.[0];
		const orderType = Shipment?.OrderType?.[0];

		const cardOrder = new Card({
			titleHeader: "Order Details",
			bodyContent: [
				{
					title: "Order Date:",
					content: orderDate,
				},
				{
					title: "Order Type:",
					content: orderType,
				},
			],
		});

		cardOrder.render();
	}

	async createPanelInfoDetail() {
		if (!this.cardContainer) {
			alert("Alerta usuario");
		}

		this.cardContainer.innerHTML = "";

		if (!this.Shipment) {
			console.error("No se encontro el objeto Shipment ");
			return null;
		}

		const shipmentId = this.Shipment?.ShipmentId?.[0] ?? "";
		const erpOrder = this.Shipment?.ErpOrder?.[0] ?? "";

		const cardShipment = new CardEditData({
			titleHeader: "Shipment Id:",
			bodyContent: [
				{
					title: shipmentId,
				},
			],
		});

		const cardErpOrder = new CardEditData({
			titleHeader: "Erp Order:",
			bodyContent: [
				{
					title: erpOrder,
				},
			],
		});

		// Comentarios Card
		const comments = this.Shipment?.Comments?.[0]?.Comment ?? [];
		const bodyContent = [];

		if (comments.length) {
			comments.forEach(({ CommentType, Text }) => {
				bodyContent.push({
					title: CommentType?.[0],
					content: Text?.[0],
				});
			});
		}

		const cardComments = new Card({
			titleHeader: "Comments",
			bodyContent,
		});

		cardShipment.render();
		cardErpOrder.render();
		this.#createPanelCustomer();
		this.#createPanelShipTo();
		cardComments.render();
		this.#createPanelOrderDetail();
	}

	static async setPanelInfoDetail(Shipment) {
		if (!Shipment) {
			alert("No se pudo inicializar el panel info detail");
		}

		const panelInfo = new GetPanelInfo(Shipment);

		panelInfo.createPanelInfoDetail();
	}
}

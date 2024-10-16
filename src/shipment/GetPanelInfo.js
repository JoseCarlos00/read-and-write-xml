import { Card, CardEditData } from "./Card.js";

/**
 * Clase para gestionar la creación y renderización de paneles de información de `Shipment`.
 */
export class GetPanelInfo {
	constructor(Shipment) {
		this.Shipment = Shipment ?? [];
		this.cardContainer = document.querySelector("#container-info");
	}

	/**
	 * Crea y renderiza un panel con la información del cliente.
	 */
	#createPanelCustomer() {
		const objCustomer = this.Shipment?.Customer?.[0];
		if (!objCustomer) {
			return;
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

	/**
	 * Crea y renderiza un panel con la dirección de envío.
	 */
	#createPanelShipTo() {
		const objCustomer = this.Shipment?.Customer?.[0];
		if (!objCustomer) {
			return;
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

	/**
	 * Crea y renderiza un panel con los detalles del `Shipment`.
	 */
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
			updateField: "shipmentId",
		});

		const cardErpOrder = new CardEditData({
			titleHeader: "Erp Order:",
			bodyContent: [
				{
					title: erpOrder,
				},
			],
			updateField: "erpOrder",
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

		// Renderizar  cards
		cardShipment.render();
		cardErpOrder.render();
		this.#createPanelCustomer();
		this.#createPanelShipTo();
		cardComments.render();
		this.#createPanelOrderDetail();
	}

	/**
	 * Método estático para inicializar el panel de información detallada del `Shipment`.
	 * @param {Object} Shipment - Objeto de `Shipment`.
	 */
	static async setPanelInfoDetail(Shipment) {
		if (!Shipment) {
			alert("No se pudo inicializar el panel info detail");
			return;
		}

		const panelInfo = new GetPanelInfo(Shipment);

		panelInfo.createPanelInfoDetail();
	}
}

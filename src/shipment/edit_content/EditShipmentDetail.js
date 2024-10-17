/**
 * Clase manejadora de los eventos en el panel de detalles para editar el contenido de un envío.
 * Proporciona métodos para habilitar la edición, gestionar eventos de entrada, y actualizar
 * el objeto `Shipment` con los cambios realizados.
 */
export class HandleEventManagerEditShipmentDetail {
	/**
	 * Crea una instancia de la clase HandleEventManagerEditShipmentDetail.
	 * @param {Object} Shipment - Objeto que contiene los detalles del envío a editar.
	 */
	constructor(Shipment) {
		this.Shipment = Shipment;

		this.currentCardContainer = null;
		this.currentLabel = null;
		this.updateField = "";
		this.input = null;
		this.currentValue = "";
	}

	/**
	 * Maneja el evento de edición en el panel de información, identifica el campo a editar
	 * y ejecuta la función correspondiente según el campo seleccionado.
	 * @param {Button} target - Elemento button que ejecuta el evento del click.
	 */
	handleEventEditPanelInfoDetail(target) {
		const { updateField } = target.dataset;
		const currentCardContainer = target.closest(".card-container");

		if (!currentCardContainer) {
			return this.showUserError(
				"Ha ocurrido un error al intentar editar el contenido"
			);
		}

		this.currentCardContainer = currentCardContainer;

		const actions = {
			shipmentId: () => this.editShipment(),
			erpOrder: () => this.editShipment(),
		};

		const action = actions[updateField];

		if (action) {
			this.updateField = updateField;
			action();
		} else {
			this.showUserError(`No se puede editar el campo: ${updateField}`);
		}
	}

	/**
	 * Inicia el proceso de edición del campo seleccionado en el panel de detalles.
	 * Prepara el input para recibir el nuevo valor y lo enfoca para editar.
	 */
	editShipment() {
		this.currentLabel =
			this.currentCardContainer.querySelector(".text-for-editing");

		if (!this.currentLabel) {
			return this.showUserError(
				"Ha ocurrido un problema al editar el contenido"
			);
		}

		this.currentCardContainer.classList.add("editing");
		this.currentValue = this.currentLabel.textContent.trim() ?? "";
		this.input = this.currentCardContainer.querySelector("input");

		if (!this.input) {
			return this.showUserError("No se encontró el campo de texto para editar");
		}

		this.input.value = this.currentValue;

		this.insertEvent();
		this.input.focus();
		this.input.select();
	}

	/**
	 * Cierra el input de edición y limpia el estado de edición del campo actual.
	 */
	closeInput = () => {
		this.input.value = "";
		this.currentCardContainer.classList.remove("editing");
		this.input.removeEventListener("keydown", this.handleInputEvents);
		this.input.removeEventListener("blur", this.handleInputEvents);
	};

	/**
	 * Actualiza el contenido de `Shipment` con el nuevo valor ingresado, si es diferente
	 * al valor actual. Si el campo a editar es válido, actualiza el objeto `Shipment`.
	 * @param {string} newValue - Nuevo valor ingresado por el usuario.
	 */
	editContent = (newValue) => {
		const { Shipment, updateField } = this;

		if (!Shipment) return this.showUserError("Error en datos de Shipment");

		const fieldMap = {
			shipmentId: "ShipmentId",
			erpOrder: "ErpOrder",
		};

		const fieldKey = fieldMap[updateField];

		if (fieldKey) {
			Shipment[fieldKey] = [newValue];
		} else {
			this.showUserError(`No se puede editar el campo: ${updateField}`);
		}

		this.currentLabel.textContent = newValue;
		this.closeInput();
	};

	/**
	 * Maneja eventos de teclado y pérdida de foco en el input de edición.
	 * Si el usuario presiona Enter o pierde el foco, guarda el nuevo valor.
	 * Si presiona Escape, cancela la edición.
	 * @param {Event} event -Objeto Event de teclado o de pérdida de foco.
	 */
	handleInputEvents = (event) => {
		if (event.type === "blur" || event.key === "Enter") {
			const newValue = this.input.value.trim();

			if (newValue === this.currentValue) {
				this.closeInput();
				return;
			}

			this.editContent(newValue);
		}

		if (event.key === "Escape") {
			this.closeInput();
		}
	};

	/**
	 * Asigna los eventos necesarios al input para manejar la edición (blur y keydown).
	 */
	insertEvent() {
		this.input.addEventListener("blur", this.handleInputEvents);
		this.input.addEventListener("keydown", this.handleInputEvents);
	}

	/**
	 * TODO: Quitar alert y  mostrar mensaje de error personalizado.
	 * Muestra un mensaje de error al usuario en caso de que ocurra un problema durante
	 * el proceso de edición.
	 * @param {string} message - Mensaje de error a mostrar.
	 */
	showUserError(message) {
		alert(message);
		console.error(message);
	}
}

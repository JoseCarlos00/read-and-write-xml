/**
 * Clase que representa una tarjeta de información.
 */
export class Card {
	/**
	 * Crea una instancia de la tarjeta.
	 * @param {Object} options - Opciones para la tarjeta.
	 * @param {string} options.titleHeader - Título de la tarjeta.
	 * @param {Array} options.bodyContent - Contenido del cuerpo de la tarjeta.
	 */
	constructor({ titleHeader = "No disponible", bodyContent = [] }) {
		this.titleHeader = titleHeader;
		this.bodyContent = bodyContent;

		this.cardContainer = document.createElement("div");
		this.cardContainer.classList.add("card-container");

		this.emptyMessage = {
			title: "No hay información disponible",
			content: "",
		};
	}

	/**
	 * Crea el encabezado de la tarjeta.
	 * @return {HTMLElement} El elemento del encabezado de la tarjeta.
	 */
	createHeader() {
		const header = document.createElement("header");

		const title = document.createElement("h3");
		title.className = "card-title mb-02";
		title.textContent = this.titleHeader;

		header.appendChild(title);
		return header;
	}

	/**
	 * Crea el pie de la tarjeta.
	 * @return {HTMLElement} El elemento del pie de la tarjeta.
	 */
	createFooter() {
		const footer = document.createElement("footer");
		footer.className = "card-footer";

		return footer;
	}

	/**
	 * Crea un hijo del cuerpo de la tarjeta.
	 * @param {Object} param0 - Objeto con título y contenido.
	 * @param {string} param0.title - Título del contenido.
	 * @param {string} param0.content - Contenido del hijo.
	 * @return {HTMLElement} El elemento del hijo creado.
	 */
	createBodyChild({ title, content }) {
		const child = document.createElement("div");
		child.className = "mb-3";

		const childContent = document.createElement("p");
		childContent.className = "pr-6 mb-0";

		childContent.innerHTML = `
			<spam class="info-title">${title}</spam>
			<span class="value-of">${content}</span>
			`;

		child.appendChild(childContent);
		return child;
	}

	/**
	 * Crea el cuerpo de la tarjeta.
	 * @return {HTMLElement} El elemento del cuerpo de la tarjeta.
	 */
	createBody() {
		const body = document.createElement("div");
		body.classList.add("card-body");

		if (this.bodyContent.length === 0) {
			const emptyMessage = this.createBodyChild(this.emptyMessage);
			body.appendChild(emptyMessage);

			return body;
		}

		this.bodyContent.forEach((values) => {
			const child = this.createBodyChild(values);
			body.appendChild(child);
		});

		return body;
	}

	/**
	 * Renderiza la tarjeta en el contenedor designado.
	 */
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

/**
 * Clase que extiende la funcionalidad de la clase Card para tarjetas editables.
 */
export class CardEditData extends Card {
	/**
	 * Crea una instancia de la tarjeta editable.
	 * @param {Object} options - Opciones para la tarjeta editable.
	 * @param {string} options.titleHeader - Título de la tarjeta.
	 * @param {Array} options.bodyContent - Contenido del cuerpo de la tarjeta.
	 * @param {string} options.updateField - Campo que se va a actualizar.
	 */
	constructor({ titleHeader, bodyContent, updateField }) {
		super({ titleHeader, bodyContent });

		this.emptyMessage = {
			title: "No hay información disponible",
		};

		this.updateField = updateField;
	}

	/**
	 * Crea el pie de la tarjeta editable.
	 * @return {HTMLElement} El elemento del pie de la tarjeta editable.
	 */
	createFooter() {
		const footer = document.createElement("footer");
		footer.className = "card-footer";
		footer.innerHTML = `
			<button class="icon" data-update-field="${this.updateField}">
				<svg >
						<use href="src/icon/icons.svg#pencil"></use>
				</svg>	
			</button>	
		`;

		return footer;
	}

	/**
	 * Crea un hijo del cuerpo de la tarjeta editable.
	 * @param {Object} param0 - Objeto con título.
	 * @param {string} param0.title - Título del contenido.
	 * @return {HTMLElement} El elemento del hijo creado.
	 */
	createBodyChild({ title }) {
		const child = document.createElement("div");
		child.className = "mb-3";

		const childContent = document.createElement("p");
		childContent.className = "pr-6 mb-0";

		childContent.innerHTML = `
			<spam class="value-of text-for-editing">${title}</spam>
			<input type="text" value="" />
			`;

		child.appendChild(childContent);
		return child;
	}
}

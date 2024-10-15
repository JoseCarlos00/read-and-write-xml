export class Card {
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

	createHeader() {
		const header = document.createElement("header");

		const title = document.createElement("h3");
		title.className = "card-title mb-02";
		title.textContent = this.titleHeader;

		header.appendChild(title);
		return header;
	}

	createFooter() {
		const footer = document.createElement("footer");
		footer.className = "card-footer";

		return footer;
	}

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

export class CardEditData extends Card {
	constructor(configuration) {
		super(configuration);

		this.emptyMessage = {
			title: "No hay información disponible",
		};
	}

	createFooter() {
		const footer = document.createElement("footer");
		footer.className = "card-footer";
		footer.innerHTML = `
			<button class="icon" data-is-element="erpOrder">
				<svg >
						<use href="src/icon/icons.svg#pencil"></use>
				</svg>	
			</button>	
		`;

		return footer;
	}

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

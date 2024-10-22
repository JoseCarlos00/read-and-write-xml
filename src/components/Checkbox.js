// Crea una hoja de estilo CSS
const checkboxStyleSheet = new CSSStyleSheet();
checkboxStyleSheet.replaceSync(/*css*/ `

  input[type="checkbox"] {
    display: none;
  }

  .check {
    cursor: pointer;
    position: relative;
    margin: auto;
    width: 18px;
    height: 18px;
    -webkit-tap-highlight-color: transparent;
    transform: translate3d(0, 0, 0);
  }
  .check:before {
    content: "";
    position: absolute;
    top: -15px;
    left: -15px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(34, 50, 84, 0.03);
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  .check svg {
    position: relative;
    z-index: 1;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke: #c8ccd4;
    stroke-width: 1.5;
    transform: translate3d(0, 0, 0);
    transition: all 0.2s ease;
  }
  .check svg path {
    stroke-dasharray: 60;
    stroke-dashoffset: 0;
    transition: all 0.3s linear;
  }
  .check svg polyline {
    stroke-dasharray: 22;
    stroke-dashoffset: 66;
    transition: all 0.2s linear;
  }
  .check:hover:before {
    opacity: 1;
  }
  .check:hover svg {
    stroke: #4285f4;
  }
  input[type=checkbox]:checked + .check svg {
    stroke: #4285f4;
  }
  input[type=checkbox]:checked + .check svg path {
    stroke-dashoffset: 60;
  }
  input[type=checkbox]:checked + .check svg polyline {
    stroke-dashoffset: 42;
    transition-delay: 0.15s;
  }
`);

class InputCheckbox extends HTMLElement {
	static nameElement = "input-checkbox";

	static get observedAttributes() {
		return ["my-id"];
	}

	constructor() {
		super();
		this._id = "cbx";

		this.attachShadow({ mode: "open" });
		this.shadowRoot.adoptedStyleSheets = [checkboxStyleSheet]; // Adjunta el CSS
	}

	connectedCallback() {
		this.#render();

		// Agregar evento de cambio al checkbox
		const checkbox = this.shadowRoot.querySelector("#cbx");

		if (checkbox) {
			checkbox.addEventListener("change", () => {
				const trElement = this.closest("tr");

				if (trElement) {
					trElement.classList.toggle("selected", checkbox.checked);
				}

				// Si no es el checkbox de "selectAll", verificar el estado general
				if (this._id !== "selectAll") {
					this.checkHeaderState();
				}
			});
		}

		if (this._id === "selectAll") {
			this.setEventSelectAll();
		}
	}

	#render() {
		this.shadowRoot.innerHTML = /*html*/ `
    <div class="container">
        <input type="checkbox" id="${this._id}"">
        <label for="${this._id}" class="check">
            <svg width="18px" height="18px" viewBox="0 0 18 18">
                <path d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z"></path>
                <polyline points="1 9 7 14 15 4"></polyline>
            </svg>
        </label>
    </div>
    `;
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (newValue === "selectAll") {
			this._id = newValue;
		}
	}

	setEventSelectAll() {
		const selectAll = this.shadowRoot.querySelector("#selectAll");

		if (selectAll) {
			selectAll.addEventListener("change", () => {
				const isChecked = selectAll.checked;
				const checkboxes = document.querySelectorAll('input-checkbox:not([my-id="selectAll"])');

				selectAll.checked = isChecked;
				if (checkboxes.length == 0) return;

				checkboxes.forEach((checkbox) => {
					const input = checkbox.shadowRoot.querySelector("#cbx");
					if (input) input.checked = isChecked;

					const trElement = checkbox.closest("tr");
					if (trElement) {
						trElement.classList.toggle("selected", isChecked);
					}
				});
			});
		}
	}

	checkHeaderState() {
		const selectAllCheckbox = document
			.querySelector('input-checkbox[my-id="selectAll"]')
			?.shadowRoot?.querySelector("#selectAll");

		if (!selectAllCheckbox) return;

		const checkboxes = document.querySelectorAll('input-checkbox:not([my-id="selectAll"])');
		const allChecked = Array.from(checkboxes).every((checkbox) => {
			const input = checkbox.shadowRoot.querySelector("#cbx");
			return input.checked;
		});

		selectAllCheckbox.checked = allChecked;
	}
}

customElements.define(InputCheckbox.nameElement, InputCheckbox);

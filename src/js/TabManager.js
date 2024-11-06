/**
 * Clase TabManager para manejar la creación, cambio y cierre de pestañas con contenido asociado.
 */
export class TabManager {
	/**
	 * Constructor de TabManager.
	 * @param {string} tabsContainerId - ID del contenedor donde se añadirán las pestañas.
	 * @param {string} contentContainerId - ID del contenedor donde se mostrará el contenido de las pestañas.
	 * @throws {Error} Si no se encuentra uno o ambos contenedores en el DOM.
	 */
	constructor({ tabsContainerId, contentContainerId }) {
		this.tabsContainer = document.getElementById(tabsContainerId);
		this.contentContainer = document.getElementById(contentContainerId);
		this.tabsMap = new Map(); // Mapa para almacenar las pestañas y su contenido correspondiente
		this.activeTab = null;

		if (!this.tabsContainer || !this.contentContainer) {
			throw new Error("No se pudo encontrar uno o ambos contenedores. Verifique los IDs proporcionados.");
		}
	}

	// Función que se llama cuando se cambia de pestaña
	setActiveTab(activeTab) {
		this.activeTab = activeTab;
		window.bridge.setActiveTab(activeTab);
	}

	/**
	 * Cambia a una pestaña específica y muestra su contenido.
	 * @param {HTMLElement} tabButton - Elemento del botón de la pestaña a activar.
	 * @param {HTMLElement} contentDiv - Contenedor de contenido correspondiente a la pestaña.
	 */
	switchTab(tabButton, contentDiv, filename) {
		if (!tabButton || !contentDiv) {
			console.warn("El botón de pestaña o el contenedor de contenido no existe.");
			return;
		}

		// Remueve la clase active de todas las pestañas y oculta todo el contenido
		this.tabsContainer.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("active"));
		this.contentContainer.querySelectorAll(".tab-content").forEach((content) => content.classList.remove("d-block"));

		// Muestra el contenido correspondiente y marca la pestaña como activa
		contentDiv?.classList?.add("d-block");

		const currentTab = tabButton.closest(".tab");
		if (currentTab) {
			currentTab.classList.add("active");
			this.setActiveTab(filename);
		}
	}

	/**
	 * Crea una nueva pestaña con su contenido asociado.
	 * Si la pestaña ya existe, cambia a ella en lugar de crear una nueva.
	 * @param {string} filename - Nombre de la pestaña y identificador único.
	 * 
	* @return {HTMLElement|null} El contenedor principal del contenido `<div class="tab-content"></div>` de la `tab` actual.

	 */
	createNewTab(filename) {
		try {
			if (typeof filename !== "string") {
				console.warn("El nombre del archivo  deben ser cadena de texto.");
				return null;
			}

			if (this.tabsMap.has(filename)) {
				console.warn(`La pestaña con el nombre ${filename} ya existe.`);
				this.switchTab(...this.tabsMap.get(filename), filename);
				return null;
			}

			// Crear el elemento de la pestaña
			const tab = document.createElement("div");
			tab.className = "tab";
			tab.innerHTML = `
				<div class="tab-border-top-container"></div>
				<button class="button-tab">
					<label class="title-label">${filename} </label>
					<span class="btn-close" title="Cerrar">
						<svg class="icon-close" viewBox="0 0 24 24">
							<use href="./src/icon/icons.svg#close"></use>
						</svg>
					</span>
				</button>
				<div class="tab-border-bottom-container"></div>
			`;

			// Añadir evento para cambiar de pestaña
			const tabButton = tab.querySelector("button");

			if (!tabButton) {
				console.warn("No se pudo crear el botón de la pestaña.");
				return null;
			}

			// Crear el contenedor de contenido para la pestaña
			const contentContainer = document.createElement("div");
			contentContainer.className = "tab-content";

			// Guardar en el mapa la referencia de la pestaña y su contenido
			this.tabsMap.set(filename, [tabButton, contentContainer]);

			// Agregar la pestaña y el contenido al DOM
			this.tabsContainer.appendChild(tab);
			this.contentContainer.appendChild(contentContainer);

			// Enfocar la nueva pestaña
			tabButton.onclick = () => this.switchTab(tabButton, contentContainer, filename);
			this.switchTab(tabButton, contentContainer, filename);

			// Agregar evento de cierre a la pestaña
			const closeButton = tab.querySelector(".btn-close");
			if (closeButton) {
				closeButton.addEventListener("click", (event) => {
					event.stopPropagation();
					this.closeTab(filename);
				});
			}

			return contentContainer;
		} catch (error) {
			console.error("[TabManager] createNewTab: Error al crear la pestaña:", error);
			return null;
		}
	}

	/**
	 * Cierra una pestaña específica y elimina su contenido.
	 * Si la pestaña estaba activa, cambia a otra pestaña si existe.
	 * @param {string} filename - Nombre de la pestaña que se va a cerrar.
	 */
	closeTab(filename) {
		const [tabButton, contentDiv] = this.tabsMap.get(filename) || [];
		const tab = tabButton?.closest(".tab");

		if (!tabButton || !contentDiv || !tab) {
			console.warn(`No se pudo encontrar la pestaña o el contenido asociado a ${filename}`);
			return;
		}

		// Si la pestaña está activa, cambiar a otra pestaña si está disponible
		if (tab.classList.contains("active") && this.tabsMap.size > 1) {
			const remainingTabs = Array.from(this.tabsMap.keys()).filter((key) => key !== filename);
			const [newTabButton, newContentDiv] = this.tabsMap.get(remainingTabs[remainingTabs.length - 1]);
			this.switchTab(newTabButton, newContentDiv, filename);
		}

		// Remover elementos del DOM y del mapa
		tab.remove();
		contentDiv.remove();
		this.tabsMap.delete(filename);
	}
}

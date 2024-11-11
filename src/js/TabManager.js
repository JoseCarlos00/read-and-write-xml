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
		this.unsavedTabs = new Set(); // Guarda nombres o IDs de pestañas modificadas
		this.activeTab = null;

		if (!this.tabsContainer || !this.contentContainer) {
			throw new Error("No se pudo encontrar uno o ambos contenedores. Verifique los IDs proporcionados.");
		}

		this.setEventListeners();
		this.listenForModifications();
	}

	listenForModifications() {
		window.bridge.modified.on("modified", (filename) => {
			console.log("Se ha modificado el archivo:", filename);
			this.markTabAsModified(filename, true);
			window.bridge.checkUnsavedTabs(this.hasUnsavedTabs());
			console.log("unsavedTabs:", this.hasUnsavedTabs(), this.unsavedTabs);
		});

		window.bridge.modified.on("saveFile", (filename) => {
			console.log("Se ha guardado el archivo", filename);
			this.markTabAsModified(filename, false);
			window.bridge.checkUnsavedTabs(this.hasUnsavedTabs());
			console.log("unsavedTabs:", this.hasUnsavedTabs(), this.unsavedTabs);
		});
	}

	markTabAsModified(filename, isModified) {
		const currentTab = filename ? filename : window.bridge.getActiveTab();

		if (!currentTab) {
			console.error("Error: No hay una pestaña activa. No se puede marcar como modificado.");
			return;
		}

		const [tabButton] = this.tabsMap.get(currentTab) || [];

		if (!tabButton) return;

		const titleLabel = tabButton.querySelector(".title-label");

		if (isModified) {
			tabButton.classList.add("modified");
			this.unsavedTabs.add(currentTab);
			console.log(":isModified,", currentTab);

			if (titleLabel && !titleLabel.textContent.includes("*")) {
				titleLabel.textContent += " *";
			}
		} else {
			tabButton.classList.remove("modified");
			this.unsavedTabs.delete(currentTab);
			if (titleLabel && titleLabel.textContent.includes(" *")) {
				titleLabel.textContent = titleLabel.textContent.replace(" *", "");
			}
		}
	}

	hasUnsavedTabs() {
		return this.unsavedTabs.size > 0;
	}

	setEventListeners() {
		// Agregar evento de click a las pestañas
		document.addEventListener("keydown", (e) => {
			const { key, ctrlKey, shiftKey } = e;

			if (ctrlKey && key === "Tab") {
				e.preventDefault();

				if (this.tabsMap.size <= 1) {
					return;
				}

				const currentTab = window.bridge.getActiveTab();

				// Validación: Si no hay una pestaña seleccionada o mapeada
				if (!this.tabsMap.has(currentTab) || !currentTab) {
					console.error("Error: No hay pestañas para cambiar o no hay pestaña seleccionada.");
					return;
				}

				// Obtener índice de la pestaña activa actual
				const currentTabIndex = Array.from(this.tabsMap.keys()).indexOf(currentTab);

				if (currentTabIndex === -1) {
					console.error("Error: no se encontró el índice de la pestaña:", currentTab);
					return;
				}

				// Determinar el índice de la siguiente pestaña (circular)
				let nextTabIndex;
				if (shiftKey) {
					// Retroceder si Shift está presionado
					nextTabIndex = currentTabIndex === 0 ? this.tabsMap.size - 1 : currentTabIndex - 1;
				} else {
					// Avanzar si solo Ctrl + Tab
					nextTabIndex = currentTabIndex === this.tabsMap.size - 1 ? 0 : currentTabIndex + 1;
				}

				// Obtener la siguiente pestaña basada en el índice calculado
				const nextTab = Array.from(this.tabsMap.keys())[nextTabIndex];

				// Actualizar la pestaña actual
				this.setActiveTab(nextTab);

				const [newTabButton, newContentDiv, newFilename] = this.tabsMap.get(nextTab);
				this.switchTab(newTabButton, newContentDiv, newFilename);
			}

			if (ctrlKey && key === "w") {
				const currentTab = window.bridge.getActiveTab();
				if (currentTab) {
					this.closeTab(currentTab);
				}
				return;
			}
		});
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
		this.contentContainer.querySelectorAll(".tab-content").forEach((content) => {
			content.classList.remove("d-block");
			contentDiv.classList.remove("active");
		});

		// Muestra el contenido correspondiente y marca la pestaña como activa
		contentDiv.classList.add("d-block");
		contentDiv.classList.add("active");

		const currentTab = tabButton.closest(".tab");
		if (currentTab) {
			currentTab.classList.add("active");
			currentTab.scrollIntoView({ behavior: "smooth", block: "center" });
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
			if (typeof filename !== "string" || !filename) {
				console.warn("El nombre del archivo  deben ser cadena de texto.");
				return null;
			}

			if (this.tabsMap.has(filename)) {
				console.warn(`La pestaña con el nombre ${filename} ya existe.`);
				this.switchTab(...this.tabsMap.get(filename));
				return { status: "existe" };
			}

			// Crear el elemento de la pestaña
			const tab = document.createElement("div");
			tab.className = "tab";
			tab.innerHTML = `
				<div class="tab-border-top-container"></div>
				<button class="button-tab">
					<label class="title-label">${filename} </label>
					<span class="indicator-container btn-close" title="Cerrar">
						<svg class="icon-close" viewBox="0 0 24 24">
							<use href="./src/icon/icons.svg#close"></use>
						</svg>
					</span>
					<span class="indicator-container modified-container">
						<svg class="icon-modified" viewBox="0 0 24 24">
							<use href="./src/icon/icons.svg#circle-white"></use>
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
			this.tabsMap.set(filename, [tabButton, contentContainer, filename]);

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
		if (!filename) {
			return;
		}

		const [tabButton, contentDiv] = this.tabsMap.get(filename) || [];
		const tab = tabButton?.closest(".tab");

		if (!tabButton || !contentDiv || !tab) {
			console.warn(`No se pudo encontrar la pestaña o el contenido asociado a ${filename}`);
			return;
		}

		// Si la pestaña está activa, cambiar a otra pestaña si está disponible
		if (tab.classList.contains("active") && this.tabsMap.size > 1) {
			const remainingTabs = Array.from(this.tabsMap.keys()).filter((key) => key !== filename);
			const [newTabButton, newContentDiv, newFilename] = this.tabsMap.get(remainingTabs[remainingTabs.length - 1]);

			this.switchTab(newTabButton, newContentDiv, newFilename);
		}

		if (this.tabsMap.size === 1) {
			this.setActiveTab("");
		}

		// Remover elementos del DOM y del mapa
		tab.remove();
		contentDiv.remove();
		this.tabsMap.delete(filename);
	}
}

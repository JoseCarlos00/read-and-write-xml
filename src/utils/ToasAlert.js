/**
 * Crea alertas para Scale;
 * Types: [error] [info]  [success] [warning]
 *
 * ToastAlert.showAlertFullTop('MSG', 'Type')
 * ToastAlert.showAlertMinBotton('MSG', 'Type')
 * 
 * TODO: Inplementar todas las posiciones de alerta
  .toast-top-left
  .toast-top-right
  .toast-bottom-left

  .toast-top-min-width 
 */
export default class ToastAlert {
	constructor({ message, type, time, _className }) {
		this.message = message;
		this.type = type;
		this.className = _className;
		this.time = time;

		this.container = document.querySelector(`.${this.className}`);

		// Comprobar si el contenedor existe; si no, crear uno
		if (!this.container) {
			this.container = document.createElement("div");
			this.container.id = "toast-container";
			this.container.className = this.className;

			document.body.appendChild(this.container);
		}
	}

	createToast() {
		const toastHTML = `
          <div class="toast toast-${this.type}">
            <button class="toast-close-button">×</button>
            <div class="toast-message">${this.message}</div>
          </div>
        `;
		this.container.innerHTML += toastHTML;

		// Agregar los event listeners para cerrar la alerta
		this.addEventListeners();
		this.setTimeDeleteAlert(this.time);
	}

	addEventListeners() {
		const closeButton = this.container.querySelector(".toast-close-button");
		const toastMessage = this.container.querySelector(".toast-message");

		if (closeButton) {
			closeButton.addEventListener("click", () => this.hide());
		}

		// Agregar el evento click al contenedor para cerrar la alerta si se hace clic fuera del toast
		this.container.addEventListener("click", (e) => {
			if (e.target === this.container || e.target === toastMessage) {
				this.hide();
			}
		});
	}

	hide() {
		if (!this.container) {
			throw new Error("No se encontro el contenedor de alerta #toast-container");
		}

		const toastElements = Array.from(this.container.querySelectorAll(".toast"));

		if (toastElements.length === 1) {
			this.container.remove();
			return;
		}

		toastElements.reverse().forEach((toast, index) => {
			if (index > 0) {
				setTimeout(() => toast.remove(), 2000);
			} else {
				toast.remove();
			}
		});
	}

	setTimeDeleteAlert(time) {
		setTimeout(() => this.hide(), time);
	}

	/**
	 *
	 * @param {String} message Mensage de alerta
	 * @param {String} type Tipo de alerta: default [error]
	 *
	 */
	static showAlertFullTop({ message, type = "error", duration = 3000 }) {
		try {
			const configuration = {
				message: message,
				type: type.toLocaleLowerCase(),
				time: duration,
				_className: "toast-top-full-width",
			};

			const toastAlert = new ToastAlert(configuration);
			toastAlert.createToast();
		} catch (error) {
			console.error("Error: a surgido un problema al crear una alerta", error);
		}
	}

	static showAlertMinBotton({ message, type = "error", duration = 3000 }) {
		try {
			const configuration = {
				message: message,
				type: type.toLocaleLowerCase(),
				time: duration,
				_className: "toast-bottom-min-width",
			};

			const toastAlert = new ToastAlert(configuration);
			toastAlert.createToast();
		} catch (error) {
			console.error("Error: a surgido un problema al crear una alerta", error);
		}
	}

	static showAlertFullBottom({ message, type = "error", duration = 3000 }) {
		try {
			const configuration = {
				message: message,
				type: type.toLocaleLowerCase(),
				time: duration,
				_className: "toast-bottom-full-width",
			};

			const toastAlert = new ToastAlert(configuration);
			toastAlert.createToast();
		} catch (error) {
			console.error("Error: a surgido un problema al crear una alerta", error);
		}
	}

	static showAlertRightBottom({ message, type = "error", duration = 3000 }) {
		try {
			const configuration = {
				message: message,
				type: type.toLocaleLowerCase(),
				time: duration,
				_className: "toast-bottom-right",
			};

			const toastAlert = new ToastAlert(configuration);
			toastAlert.createToast();
		} catch (error) {
			console.error("Error: a surgido un problema al crear una alerta", error);
		}
	}
}

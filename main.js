const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron/main");
const path = require("node:path");
const fs = require("node:fs");
const xml2js = require("xml2js");

const isDev = process.env.NODE_ENV !== "production";
const isMac = process.platform === "darwin";

let mainWindow = null;

function createMainWindow() {
	mainWindow = new BrowserWindow({
		width: isDev ? 1000 : 500,

		webPreferences: {
			nodeIntegration: true,
			contextIsolation: true,
			preload: path.join(__dirname, "preload.js"),
		},
	});

	mainWindow.loadFile("index.html");

	// Show devtools automatically if in development
	if (isDev) {
		mainWindow.webContents.openDevTools();
	}
}

app.whenReady().then(() => {
	// Manejar el evento 'select-file' para abrir el diálogo y leer el archivo
	ipcMain.handle("dialog:select-file", selectFile);
	ipcMain.handle("dialog:save-file", saveFile);

	createMainWindow();

	app.on("activate", function () {
		if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
	});
});

app.on("window-all-closed", () => {
	if (!isMac) app.quit();
});

const parser = new xml2js.Parser();

async function selectFile() {
	try {
		const { canceled, filePaths } = await dialog.showOpenDialog({
			properties: ["openFile"],
			filters: [{ name: "Archivos XML", extensions: ["xml", "shxmlP"] }],
			title: "Selecione un  archivo XML",
			buttonLabel: "Abrir",
		});

		if (canceled || filePaths.length === 0) {
			return null;
		}

		const filePath = filePaths[0];
		const fileContent = fs.readFileSync(filePath, "utf-8");

		if (!fileContent) return null;

		// Extraer el nombre del archivo
		const fileName = path.basename(filePath);

		// Devuelve una promesa que se resuelve con el resultado del análisis XML
		return new Promise((resolve, reject) => {
			parser.parseString(fileContent, function (err, result) {
				if (err) {
					reject(err);
				} else {
					const data =
						result?.WMWROOT?.WMWDATA?.[0]?.Shipments?.[0]?.Shipment?.[0];
					resolve({ original: result, shipment: data, fileName });
				}
			});
		});
	} catch (error) {
		console.error("Error:", error);
	}
}

// Función para guardar archivo
async function saveFile(event, { content, fileName = "archivo.xml" }) {
	try {
		if (!content) {
			throw new Error("No existe el  contenido para guardar");
		}

		const result = await dialog.showSaveDialog({
			title: "Guardar archivo",
			defaultPath: fileName,
		});

		console.log("path:", result.filePath);

		if (!result.canceled && result.filePath) {
			try {
				fs.writeFileSync(result.filePath, content);
				return { success: true, filePath: result.filePath };
			} catch (error) {
				console.error("Error al guardar el archivo:", error);
				return { success: false, error: error.message };
			}
		}

		return { success: false, error: "El usuario canceló la acción" };
	} catch (error) {
		console.error("Error en el diálogo de guardar:", error);
		return { success: false, error: "Error al  guardar el archivo" };
	}
}

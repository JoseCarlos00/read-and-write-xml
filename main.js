const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron/main");
const { updateElectronApp } = require("update-electron-app");
const log = require("electron-log");

const fs = require("fs");
const path = require("node:path");
const xml2js = require("xml2js");

const isDev = process.env.NODE_ENV !== "production";
const isMac = process.platform === "darwin";

let mainWindow = null;
let hasUnsavedTabs = false;

// Inicializar el logger
// Configura el logger para guardar los logs en un archivo
log.transports.file.resolvePathFn = () => path.join(app.getPath("userData"), "logs", "app.log");
log.transports.file.level = "info";
log.info("La aplicacion se ha iniciado");

updateElectronApp({
	logger: log,
	notifyUser: true,
});

if (require("electron-squirrel-startup")) app.quit();

// Comprobar si la aplicación ya está en ejecución
const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
	app.quit();
} else {
	app.on("second-instance", (_, argv) => {
		// Usuario solicitó una segunda instancia de la aplicación

		if (mainWindow) {
			if (mainWindow.isMinimized()) mainWindow.restore();
			mainWindow.focus();
		}

		// Procesar los argumentos de la segunda instancia
		handleFileOpenInWindows(argv);
	});

	app.on("ready", () => {
		createMainWindow();

		// Manejar los argumentos de la primera instancia
		handleFileOpenInWindows(process.argv);
	});
}

function createMainWindow() {
	mainWindow = new BrowserWindow({
		width: isDev ? 1250 : 500,
		icon: path.join(__dirname, "icon.ico"),

		webPreferences: {
			nodeIntegration: true,
			contextIsolation: true,
			preload: path.join(__dirname, "preload.js"),
		},
	});

	Menu.setApplicationMenu(mainMenu);

	mainWindow.loadFile("index.html");

	mainWindow.webContents.on("context-menu", () => {
		contextTemplate.popup(mainMenu.webContents);
	});

	// Este código maneja el evento close de la ventana
	mainWindow.on("close", (event) => {
		event.preventDefault();
		closeMainWindows();
	});
}

app.whenReady().then(() => {
	app.on("activate", function () {
		if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
	});

	log.info(`Checking for updates. Current version ${app.getVersion()}`);
});

app.on("window-all-closed", () => {
	if (!isMac) app.quit();
});

async function closeMainWindows() {
	const quit = () => {
		mainWindow.destroy();
		app.quit();
	};

	// Si las pestañas sin guardar se manejan correctamente, puedes cerrar la ventana
	if (hasUnsavedTabs) {
		const choice = dialog.showMessageBoxSync(mainWindow, {
			type: "warning",
			buttons: ["Cancelar", "Salir sin guardar"],
			defaultId: 0,
			message: "Hay pestañas con cambios sin guardar. ¿Estás seguro de que quieres salir?",
		});

		if (choice === 1) {
			quit();
		}

		return;
	}

	quit();
}

ipcMain.on("check-unsaved-tabs", (_, unsavedTabs) => {
	console.log("ipcMain.on:'check-unsaved'", unsavedTabs);
	hasUnsavedTabs = unsavedTabs;
});

//Global exception handler
process.on("uncaughtException", function (err) {
	console.log("Error no controlado:", err);
	log.error("Error no controlado:", err);
});

function handleFileOpenInWindows(argv) {
	const argsArray = argv.slice(app.isPackaged ? 1 : 2); // Obtén argumentos a partir de la ruta de ejecución
	const validatedExtensions = ["xml", "shxmlp", "shxml", "rcxml", "recxmlp"];
	console.log({ isPackaged: app.isPackaged });

	// Filtrar solo argumentos que tengan extensiones válidas, existan como archivos y no sean parámetros
	const filePath = argsArray.find((arg) => {
		const ext = path.extname(arg).toLowerCase().substring(1); // Obtén la extens
		return validatedExtensions.includes(ext) && fs.existsSync(arg);
	});

	// Verificar si se encontró una ruta de archivo válida
	if (filePath) {
		console.log("Archivo abierto:", filePath);
		mainWindow.webContents.send("file-opened", filePath);
	} else {
		console.log("No se encontro un archivo valido en los argumentos:", argsArray);
	}
}

const parser = new xml2js.Parser();

async function handleParseResult({ result }) {
	const Shipment = result?.WMWROOT?.WMWDATA?.[0]?.Shipments?.[0]?.Shipment?.[0];
	const Receipt = result?.WMWROOT?.WMWDATA?.[0]?.Receipts?.[0]?.Receipt?.[0];

	// Si el nodo `Shipment` está presente, devolvemos como tipo "Shipment"
	if (Shipment) {
		return { name: "Shipment", data: Shipment };
	}
	// Si el nodo `Receipt` está presente, devolvemos como tipo "Receipt"
	else if (Receipt) {
		return { name: "Receipt", data: Receipt };
	}

	// Si no es ninguno, devolvemos null o un mensaje
	return { name: "Unknown", data: null };
}

function parseFile({ filePath, fileContent }) {
	if (!filePath || !fileContent) {
		console.log("[parseFile]: No se encontro un archivo valido para parsear");
		log.info("[parseFile]: No se encontro un archivo valido para parsear");
		return null;
	}

	// Extraer el nombre del archivo
	const fileName = path.basename(filePath);

	// Devuelve una promesa que se resuelve con el resultado del análisis XML
	return new Promise((resolve, reject) => {
		parser.parseString(fileContent, async function (err, result) {
			if (err) {
				reject(err);
			} else {
				const dataResult = await handleParseResult({ result });
				resolve({ fileOriginal: result, dataResult, fileName, filePath });
			}
		});
	});
}

async function selectFileMultiple() {
	try {
		const { canceled, filePaths } = await dialog.showOpenDialog({
			properties: ["openFile", "multiSelections"],
			filters: [
				{
					name: "Archivos XML",
					extensions: ["xml", "shxmlP", "shxml", "rcxml", "recxmlP"],
				},
			],
			title: "Seleccione archivos XML",
			buttonLabel: "Abrir",
		});

		if (canceled || filePaths.length === 0) {
			return null;
		}

		// Leer el contenido de todos los archivos seleccionados
		const filePromises = filePaths.map(async (filePath) => {
			const fileContent = await fs.promises.readFile(filePath, "utf-8");
			return parseFile({ filePath, fileContent });
		});

		// Esperar a que se resuelvan todas las promesas
		return await Promise.all(filePromises);
	} catch (error) {
		console.error("Error:", error);
	}
}

// Función para guardar archivo como
async function saveFileAs(event, { content, fileName = "archivo" }) {
	try {
		if (!content) {
			throw new Error("No existe el  contenido para guardar");
		}

		const result = await dialog.showSaveDialog({
			title: "Guardar archivo como",
			defaultPath: fileName,
			filters: [
				{ name: "Archivo XML", extensions: ["shxmlP"] },
				{ name: "Archivo XML", extensions: ["shxml"] },
				{ name: "Archivo XML", extensions: ["xml"] },
				{ name: "Archivo XML", extensions: ["recxmlP"] },
				{ name: "Archivo XML", extensions: ["rcxml"] },
			],
		});

		if (!result.canceled && result.filePath) {
			console.log("saveFileAs:", result);
			try {
				fs.writeFileSync(result.filePath, content, "utf-8");

				mainWindow.webContents.send("file-opened", result.filePath);
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

// Funcion para guardar remplazando el archivo actual
async function saveFile(event, { content, fileName, filePath }) {
	try {
		if (!content) {
			throw new Error("No hay contenido para guardar");
		}

		if (!filePath) {
			// Si no hay ruta actual, llama a "Guardar como" en su lugar
			console.log("saveFile: No hay ruta actual");
			return saveFileAs(event, { content, fileName });
		}

		// Sobrescribir el archivo en la ruta actual
		fs.writeFileSync(filePath, content, "utf-8");
		return { success: true, filePath };
	} catch (error) {
		console.error("Error al guardar el archivo:", error);
		return { success: false, error: error.message };
	}
}

async function readFile(event, { filePath }) {
	try {
		if (!filePath) {
			throw new Error("[readFile] No hay ruta de archivo");
		}

		const fileContent = await fs.promises.readFile(filePath, "utf-8");
		if (!fileContent) return null;

		return parseFile({ filePath, fileContent });
	} catch (error) {
		console.error("Error al leer el archivo:", error);
		log.error("[readFile] No hay ruta de archivo:" + error);
		throw new Error("No se pudo leer el archivo.");
	}
}

// Manejar el evento 'select-file' para abrir el diálogo y leer el archivo
ipcMain.handle("dialog:select-file", selectFileMultiple);
ipcMain.handle("dialog:save-file", saveFile);
ipcMain.handle("dialog:save-file-as", saveFileAs);

ipcMain.handle("win:read-file", readFile);

ipcMain.handle("get-version", (event, argv) => {
	return app.getVersion();
});

// Crear el menú de la aplicación
const mainMenu = Menu.buildFromTemplate([
	{
		label: "Archivo",
		submenu: [
			{
				label: "Abrir archivo",
				accelerator: "CmdOrCtrl+O",
				click: () => {
					mainWindow.webContents.send("menu-open-file");
				},
			},
			{
				label: "Guardar archivo",
				accelerator: "CmdOrCtrl+S",
				click: () => {
					mainWindow.webContents.send("menu-save-file");
				},
			},
			{
				label: "Guardar Archivo Como",
				accelerator: "CmdOrCtrl+Shift+S",
				click: () => {
					mainWindow.webContents.send("menu-save-file-as");
				},
			},
			{ type: "separator" },
			isMac ? { role: "close" } : { role: "quit" },
		],
	},
	// { role: 'viewMenu' }
	isDev
		? {
				label: "View",
				submenu: [
					{ role: "reload" },
					{ role: "forceReload" },
					{ role: "toggleDevTools" },
					{ type: "separator" },
					{ role: "resetZoom" },
					{ role: "zoomIn" },
					{ role: "zoomOut" },
					{ type: "separator" },
					{ role: "togglefullscreen" },
				],
		  }
		: "",
]);

const contextTemplate = Menu.buildFromTemplate([
	{
		label: "Abrir archivo",
		accelerator: "CmdOrCtrl+O",
		click: () => {
			mainWindow.webContents.send("menu-open-file");
		},
	},
	{
		label: "Guardar archivo",
		accelerator: "CmdOrCtrl+S",
		click: () => {
			mainWindow.webContents.send("menu-save-file");
		},
	},
	{
		label: "Guardar Archivo Como",
		accelerator: "CmdOrCtrl+Shift+S",
		click: () => {
			mainWindow.webContents.send("menu-save-file-as");
		},
	},
	{
		type: "separator",
	},
	{
		role: "close",
	},
	{
		role: "reload",
	},
]);

const { contextBridge, ipcRenderer } = require("electron/renderer");
const xml2js = require("xml2js");

const builder = new xml2js.Builder();

contextBridge.exposeInMainWorld("fileApi", {
	selectFile: () => ipcRenderer.invoke("dialog:select-file"),
	saveFile: ({ content, fileName }) =>
		ipcRenderer.invoke("dialog:save-file", { content, fileName }),
	saveFileAs: ({ content, fileName }) =>
		ipcRenderer.invoke("dialog:save-file-as", { content, fileName }),
	createXMLFile,
});

contextBridge.exposeInMainWorld("ipcRenderer", {
	openFileEvent: (callback) => ipcRenderer.on("menu-open-file", callback),
	saveFileEvent: (callback) => ipcRenderer.on("menu-save-file", callback),
	saveFileAsEvent: (callback) => ipcRenderer.on("menu-save-file-as", callback),
});

async function createXMLFile(data) {
	const xml = builder.buildObject(data);
	return xml;
}

const { contextBridge, ipcRenderer } = require("electron/renderer");
const xml2js = require("xml2js");

const builder = new xml2js.Builder();

contextBridge.exposeInMainWorld("fileApi", {
	selectFile: () => ipcRenderer.invoke("dialog:select-file"),
	saveFile: ({ content, fileName }) =>
		ipcRenderer.invoke("dialog:save-file", { content, fileName }),
	createXMLFile,
});

async function createXMLFile(data) {
	const xml = builder.buildObject(data);
	return xml;
}

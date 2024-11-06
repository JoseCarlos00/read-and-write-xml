const { contextBridge, ipcRenderer } = require("electron/renderer");
const xml2js = require("xml2js");

const builder = new xml2js.Builder();

class ActiveTabManager {
	#activeTabManager;

	set activeTab(tab) {
		this.activeTabManager = tab;
	}

	get activeTab() {
		return this.activeTabManager;
	}
}

const activeTabManager = new ActiveTabManager();

contextBridge.exposeInMainWorld("fileApi", {
	selectFile: () => ipcRenderer.invoke("dialog:select-file"),
	saveFile: ({ content, fileName, filePath }) =>
		ipcRenderer.invoke("dialog:save-file", { content, fileName, filePath }),
	saveFileAs: ({ content, fileName }) => ipcRenderer.invoke("dialog:save-file-as", { content, fileName }),
	readFile: ({ filePath }) => ipcRenderer.invoke("win:read-file", { filePath }),
	createXMLFile,
});

contextBridge.exposeInMainWorld("ipcRenderer", {
	openFileEvent: (callback) => ipcRenderer.on("menu-open-file", callback),
	saveFileEvent: (callback) => ipcRenderer.on("menu-save-file", callback),
	saveFileAsEvent: (callback) => ipcRenderer.on("menu-save-file-as", callback),
	openFileWindows: (callback) => ipcRenderer.on("file-opened", callback),
});

contextBridge.exposeInMainWorld("bridge", {
	version: async () => await ipcRenderer.invoke("get-version"),
	setActiveTab: (tab) => (activeTabManager.activeTab = tab),
	getActiveTab: () => activeTabManager.activeTab,
});

async function createXMLFile(data) {
	const xml = builder.buildObject(data);
	return xml;
}

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("miaDesktop", {
  getDeepSeekStatus: () => ipcRenderer.invoke("deepseek:status"),
  saveDeepSeekConfig: (apiKey, model) =>
    ipcRenderer.invoke("deepseek:save", { apiKey, model }),
  deleteDeepSeekConfig: () => ipcRenderer.invoke("deepseek:delete"),
});

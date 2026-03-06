const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    // Hàm đóng app
    closeApp: () => ipcRenderer.send("close-app"),

    // Hàm thu nhỏ app
    minimizeApp: () => ipcRenderer.send("minimize-app"),

    // Hàm lấy danh sách game
    getGames: () => ipcRenderer.invoke("get-games"),

    // Hàm thêm game mới
    addGame: () => ipcRenderer.invoke("add-game"),

    runGame: (game) => ipcRenderer.invoke("run-game", game),

});

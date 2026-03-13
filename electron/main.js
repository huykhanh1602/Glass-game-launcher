import { app, BrowserWindow, dialog, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import process from "node:process";
import fs from "fs/promises";
import { spawn } from "child_process";
import { setupIpcHandlers } from "./ipcHandlers.js";
import { protocol } from "electron";
import { net } from "electron";

// Tái tạo biến __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "..", "src", "data.json");

app.whenReady().then(() => {
    protocol.handle("assets", (request) => {
        const url = request.url.replace("assets://", "");
        try {
            console.log("Fetching asset:", url);
            return net.fetch("file://" + decodeURIComponent(url));
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    });
});

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        frame: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, "preload.js"),
        },
    });

    // Load web from Vite
    win.loadURL("http://localhost:5173");

    // Handle IPC messages
    setupIpcHandlers(win);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

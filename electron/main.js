import { app, BrowserWindow, dialog, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import process from "node:process";
import fs from "fs/promises";
import { spawn } from "child_process";
import { exec } from "child_process";
import SteamGrid from "./service/SteamGrid.js";
import { setupIpcHandlers } from "./ipcHandlers.js";

// Tái tạo biến __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "..", "src", "data.json");

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

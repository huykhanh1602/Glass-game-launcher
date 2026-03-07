import { ipcMain, dialog } from "electron";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import Controller from "./Controller.js";

// Tái tạo biến __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "..", "src", "data.json");

export function setupIpcHandlers(win) {
    ipcMain.on("minimize-app", () => {
        win.minimize();
    });
    ipcMain.on("close-app", () => {
        win.close();
    });
    ipcMain.handle("open-settings", () => {
        alert("Settings clicked");
    });
    ipcMain.handle("get-games", async () => {
        return Controller.handleGetGames();
    });

    ipcMain.handle("add-game", async () => {
        return Controller.addGame(win);
    });

    ipcMain.handle("run-game", async (event, game) => {
        return Controller.runGame(game);
    });
}

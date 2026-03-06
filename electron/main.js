import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import process from "node:process";
import fs from "fs/promises";
import { spawn } from "child_process";
import { exec } from "child_process";

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

    // Load trang web from Vite
    win.loadURL("http://localhost:5173");

    // Handle IPC messages
    ipcMain.on("minimize-app", () => {
        win.minimize();
    });

    ipcMain.on("close-app", () => {
        win.close();
    });

    ipcMain.handle("get-games", async () => {
        try {
            const data = await fs.readFile(DATA_PATH, "utf-8");
            return JSON.parse(data).games;
        } catch (error) {
            console.error("Error reading games data:", error);
            return [];
        }
    });

    ipcMain.handle("add-game", async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog(win, {
            title: "Select Game Executable",
            filters: [{ name: "Executables", extensions: ["exe"] }],
            properties: ["openFile"],
        });

        if (canceled || filePaths.length === 0) {
            return null;
        }

        const filePath = filePaths[0];
        const fileName = path.basename(filePath, path.extname(filePath));

        try {
            const data = await fs.readFile(DATA_PATH, "utf-8");
            const json = JSON.parse(data);

            const newGame = {
                id: Date.now().toString(),
                name: fileName,
                path: filePath,
            };

            json.games.push(newGame);
            await fs.writeFile(DATA_PATH, JSON.stringify(json, null, 2));

            return newGame;
        } catch (error) {
            console.error("Error adding game:", error);
            return null;
        }
    });

    ipcMain.handle("run-game", async (event, game) => {
        //running application
        exec(`"${game.path}"`, (error) => {
            if (error) {
                console.error("Lỗi khi chạy game:", error);
            }
        });
        return true;
    });
}

ipcMain.handle("fetch-game-image", async (event, gameName) => {
    try {
        return await fetchGameImage(gameName);
    } catch (error) {
        console.error("Error fetching game image:", error);
        return null;
    }
});

async function fetchGameImage(gameName) {
    try {
        const response = await fetch(
            "https://www.steamgriddb.com/api/v2/search/autocomplete/" +
                encodeURIComponent(gameName),
            {
                headers: { Authorization: `Bearer ${SteamGridDB_API_KEY}` },
            },
        );
    } catch (error) {
        console.error("Error fetching game image:", error);
        return null;
    }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

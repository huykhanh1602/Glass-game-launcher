import { fileURLToPath } from "url";
import path from "path";
import { dialog } from "electron";
import fs from "fs/promises";
import { spawn } from "child_process";
import { exec } from "child_process";
import SteamGrid from "./service/SteamGrid.js";
import { app } from "electron";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "..", "src", "data.json");

export async function handleGetGames() {
    try {
        const data = await fs.readFile(DATA_PATH, "utf-8");
        return JSON.parse(data).games;
    } catch (error) {
        console.error("Error reading games data:", error);
        alert("Error reading games data.");
        return [];
    }
}

export async function addGame(win) {
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
        title: "Select Game Executable",
        filters: [{ name: "Executables", extensions: ["exe"] }],
        properties: ["openFile"],
    });

    if (canceled || filePaths.length === 0) {
        return null;
    }

    const filePath = filePaths[0];
    let fileName = path.basename(filePath, path.extname(filePath));
    fileName = fileName.replace(/([a-z])([A-Z])/g, "$1 $2");

    console.log("Selected Game:", fileName, filePath);

    try {
        const id = await SteamGrid.fetchGameId(fileName);
        if (!id) {
            console.error("No game ID found for:", fileName);
            alert(`No game ID found for: ${fileName}`);
            return null;
        }
        const data = await fs.readFile(DATA_PATH, "utf-8");
        const json = JSON.parse(data);
        const assetsPath = await SaveGameAssets(id);
        const newGame = {
            id: id || null,
            name: fileName,
            path: filePath,
            assetsPath: assetsPath,
        };
        if (newGame.id === null) {
            console.error("Can't find any game ID for:", fileName);
            alert(`Can't find any game ID for: ${fileName}`);
            return null;
        }

        json.games.push(newGame);
        await fs.writeFile(DATA_PATH, JSON.stringify(json, null, 2));

        return newGame;
    } catch (error) {
        console.error("Error adding game:", error);
        return null;
    }
}

export async function runGame(game) {
    exec(`"${game.path}"`, (error) => {
        if (error) {
            console.error("Error running game:", error);
        }
    });
    return true;
}

async function getGameAssets(gameId) {}

/**
 * Download and save game assets (icon, cover) to local storage for later use
 * @param {String} gameId of the game to save assets
 */
async function SaveGameAssets(gameId) {
    try {
        const userDataPath = app.getPath("userData");
        const assetsDir = path.join(userDataPath, "assets", String(gameId));

        await fs.mkdir(assetsDir, { recursive: true });

        const downloadFile = async (url) => {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            return Buffer.from(arrayBuffer);
        };

        const iconUrl = await SteamGrid.fetchGameIcon(gameId);
        if (!iconUrl) {
            console.error("No icon URL found for game ID:", gameId);
            return;
        }
        const CoverUrl = await SteamGrid.fetchGameHeros(gameId);
        if (!CoverUrl) {
            console.error("No cover URL found for game ID:", gameId);
            return;
        }

        const [iconData, coverData] = await Promise.all([
            downloadFile(iconUrl),
            downloadFile(CoverUrl),
        ]);

        const iconPath = path.join(assetsDir, "icon.jpg");
        const coverPath = path.join(assetsDir, "cover.jpg");
        await Promise.all([fs.writeFile(iconPath, iconData), fs.writeFile(coverPath, coverData)]);

        console.log("Game assets saved successfully for game ID:", gameId);
        return assetsDir;
    } catch (error) {
        console.error("Error saving game assets:", error);
    }
}

export default { handleGetGames, addGame, runGame };

import { fileURLToPath } from "url";
import path from "path";
import { dialog } from "electron";
import fs from "fs/promises";
import { spawn } from "child_process";
import { exec } from "child_process";

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
}

export async function runGame(game) {
    exec(`"${game.path}"`, (error) => {
        if (error) {
            console.error("Lỗi khi chạy game:", error);
        }
    });
    return true;
}

export default { handleGetGames, addGame, runGame };

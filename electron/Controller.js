import { fileURLToPath } from "url";
import path from "path";
import { ipcMain, dialog } from "electron";
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

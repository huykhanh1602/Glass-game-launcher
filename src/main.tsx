import "./style.css";

interface Game {
    id: string;
    name: string;
    path: string;
    iconUrl?: string;
    description?: string;
    backgroundImage?: string;
}

const DEFAULT_ICON = "https://cdn-icons-png.flaticon.com/512/681/681392.png";
const DEFAULT_BG = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop";

let games: Game[] = [];
let activeGameId: string | null = null;

// DOM Elements
const gameListEl = document.getElementById("game-list") as HTMLUListElement;
const gameTitleEl = document.getElementById("game-title") as HTMLHeadingElement;
const gameDescriptionEl = document.getElementById("game-description") as HTMLDivElement;
const addGameBtn = document.getElementById("add-game-btn") as HTMLButtonElement;
const appEl = document.getElementById("app") as HTMLDivElement;

const minimizeBtn = document.getElementById("minimize-btn") as HTMLButtonElement;
const settingsBtn = document.getElementById("settings-btn") as HTMLButtonElement;
const closeBtn = document.getElementById("close-btn") as HTMLButtonElement;

const runGameBtn = document.getElementById("play-btn") as HTMLButtonElement;

declare global {
    interface Window {
        electronAPI?: {
            closeApp: () => void;
            minimizeApp: () => void;
            getGames: () => Promise<Game[]>;
            addGame: () => Promise<Game | null>;
            runGame: (game: Game) => Promise<boolean>;
        };
    }
}

function handleMinimize() {
    window.electronAPI?.minimizeApp();
}

function handleClose() {
    window.electronAPI?.closeApp();
}

function handleSettings() {
}

function renderGames() {
    gameListEl.innerHTML = "";
    games.forEach((game) => {
        const li = document.createElement("li");
        li.className = `game-item ${game.id === activeGameId ? "active" : ""}`;
        li.title = game.name;

        const img = document.createElement("img");
        img.src = game.iconUrl || DEFAULT_ICON;
        img.alt = game.name;

        li.appendChild(img);
        li.addEventListener("click", () => selectGame(game.id));

        gameListEl.appendChild(li);
    });
}

function selectGame(id: string) {
    activeGameId = id;
    const game = games.find((g) => g.id === id);
    if (game) {
        gameTitleEl.textContent = game.name;
        gameDescriptionEl.textContent = game.description || `Path: ${game.path}`;
        appEl.style.backgroundImage = `url('${game.backgroundImage || DEFAULT_BG}')`;
    }
    renderGames();
}

async function addNewGame() {
    if (!window.electronAPI) return;
    
    const newGame = await window.electronAPI.addGame();
    if (newGame) {
        games.push(newGame);
        renderGames();
        selectGame(newGame.id);
    }
}
async function runGame() {
    console.log("Run game clicked");
    if (!window.electronAPI || !activeGameId) {
        console.error("Không tìm thấy thông tin game để khởi chạy!");
        return;
    }

    // selectedGame ở đây có kiểu là Game | undefined
    const selectedGame = games.find((g) => g.id === activeGameId);

    // Bước kiểm tra an toàn:
    if (selectedGame) {
        // Bên trong khối 'if' này, TypeScript hiểu chắc chắn selectedGame là 'Game' 
        // chứ không phải 'undefined' nữa, nên lỗi sẽ biến mất!
        await window.electronAPI.runGame(selectedGame);
    } else {
        console.error("Không tìm thấy thông tin game để khởi chạy!");
    }
}

async function init() {
    if (window.electronAPI) {
        games = await window.electronAPI.getGames();
    }
    
    addGameBtn?.addEventListener("click", addNewGame);
    minimizeBtn?.addEventListener("click", handleMinimize);
    settingsBtn?.addEventListener("click", handleSettings);
    closeBtn?.addEventListener("click", handleClose);
    runGameBtn?.addEventListener("click", runGame);

    renderGames();

    if (games.length > 0) {
        selectGame(games[0].id);
    }
}

init();

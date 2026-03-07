import { SteamGridDB_API_KEY } from "./API_key.js";

export async function fetchGameId(gameName) {
    try {
        const response = await fetch(
            "https://www.steamgriddb.com/api/v2/search/autocomplete/" +
                encodeURIComponent(gameName),
            {
                headers: { Authorization: `Bearer ${SteamGridDB_API_KEY}` },
            },
        );

        const data = await response.json();
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        } else if (!data.success || data.data.length === 0) return null;

        console.log("Game ID Fetched:", data?.data[0]?.id);
        return data?.data[0]?.id;
    } catch (error) {
        console.error("Error fetching game ID:", error);
        return null;
    }
}

export async function fetchGameIcon(game_id) {
    try {
        const response = await fetch(`https://www.steamgriddb.com/api/v2/icons/game/${game_id}`, {
            headers: { Authorization: `Bearer ${SteamGridDB_API_KEY}` },
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        } else if (!data.success || data.data.length === 0) return null;

        console.log("Game Icon Fetched:", data.data[0]?.url);
        return data.data[0]?.url;
    } catch (error) {
        console.error("Error fetching game icon:", error);
        return null;
    }
}

export async function fetchGameHeros(game_id) {
    try {
        const response = await fetch(`https://www.steamgriddb.com/api/v2/heroes/game/${game_id}`, {
            headers: { Authorization: `Bearer ${SteamGridDB_API_KEY}` },
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        } else if (!data.success || data.data.length === 0) return null;
        console.log("Game Heroes Fetched:", data.data[0]?.url);
        return data.data[0]?.url;
    } catch (error) {
        console.error("Error fetching game heroes:", error);
        return null;
    }
}

export default { fetchGameId, fetchGameIcon, fetchGameHeros };

fetchGameId("arknight endfield").then((data) => {
    if (data) {
        console.log("Game ID data:", data);
        fetchGameIcon(data).then((iconUrl) => {
            console.log("Icon URL:", iconUrl);
        });
        fetchGameHeros(data).then((heroUrl) => {
            console.log("Hero URL:", heroUrl);
        });
    }
});

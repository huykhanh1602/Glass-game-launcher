import { SteamGridDB_API_KEY } from "./API.js";

async function fetchGameId(gameName) {
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

        console.log("Fetched game image data:", data);
        return data;
    } catch (error) {
        console.error("Error fetching game ID:", error);
        return null;
    }
}
    
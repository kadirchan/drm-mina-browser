// const ENDPOINT = process.env.ENDPOINT;
const ENDPOINT = "http://165.227.156.229/";

export async function fetchGameData() {
    const headers = { "Content-Type": "application/json" };

    const res = await fetch(ENDPOINT + "game-data", { headers, method: "GET" });
    const json = await res.json();
    if (json.errors) {
        console.error(json.errors);
        throw new Error("Failed to fetch API");
    }
    return json;
}

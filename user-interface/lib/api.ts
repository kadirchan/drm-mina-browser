const ENDPOINT = "http://localhost:8080/";

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

export async function toggleGameWishlist(userPubKey: string, gameId: number) {
    const headers = { "Content-Type": "application/json" };

    const res = await fetch(ENDPOINT + "wishlist/" + userPubKey, {
        headers,
        method: "POST",
        body: JSON.stringify({ gameId }),
    });
    const json = await res.json();
    if (json.errors) {
        console.error(json.errors);
        throw new Error("Failed to add wishlist API");
    }
}

export async function fetchWishlist(userPubKey: string) {
    const headers = { "Content-Type": "application/json" };

    const res = await fetch(ENDPOINT + "wishlist/" + userPubKey, { headers, method: "GET" });
    const json = await res.json();
    if (json.errors) {
        console.error(json.errors);
        throw new Error("Failed to fetch wishlist API");
    }
    return json;
}

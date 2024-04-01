import { create } from "zustand";

interface GameStoreState {
    games: Game[];
    discountGames: Game[];
    setGames: (gameList: Game[]) => void;
    setDiscountGames: (gameList: Game[]) => void;
}

export const useGamesStore = create<GameStoreState>()((set) => ({
    games: [],
    discountGames: [],
    setGames: (gameList) => set({ games: gameList }),
    setDiscountGames: (gameList) => set({ discountGames: gameList }),
}));

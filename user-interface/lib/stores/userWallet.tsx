import { create } from "zustand";

interface UserState {
    isConnected: boolean;
    isConnecting: boolean;
    userPublicKey?: string;
    userMinaBalance: number;
    wishlist: number[];
    // wishlistFlag: boolean;
    library: number[];

    setConnected: (connected: boolean) => void;
    setConnecting: (connecting: boolean) => void;
    setUserPublicKey: (publicKey: string) => void;
    setUserMinaBalance: (balance: number) => void;
    setWishlist: (wishlist: number[]) => void;
    addWishlist: (gameId: number) => void;
    removeWishlist: (gameId: number) => void;
    // setFlag: () => void;
    // nullifyFlag: () => void;
    setLibrary: (library: number[]) => void;
    disconnect: () => void;
}

export const useUserStore = create<UserState>()((set) => ({
    isConnected: false,
    isConnecting: false,
    userPublicKey: "",
    userMinaBalance: 0,
    wishlist: [],
    // wishlistFlag: false,
    library: [],

    setConnected: (connected) => set({ isConnected: connected }),
    setConnecting: (connecting) => set({ isConnecting: connecting }),
    setUserPublicKey: (publicKey) => set({ userPublicKey: publicKey }),
    setUserMinaBalance: (balance) => set({ userMinaBalance: balance }),
    addWishlist: (gameId) => set((state) => ({ wishlist: [...state.wishlist, gameId] })),
    removeWishlist: (gameId) =>
        set((state) => ({ wishlist: state.wishlist.filter((id) => id !== gameId) })),
    setWishlist: (wishlist) => set({ wishlist }),
    // setFlag: () => set({ wishlistFlag: true }),
    // nullifyFlag: () => set({ wishlistFlag: false }),
    setLibrary: (library) => set({ library }),
    disconnect: () =>
        set({
            isConnected: false,
            isConnecting: false,
            userPublicKey: "",
            userMinaBalance: 0,
            wishlist: [],
            library: [],
        }),
}));

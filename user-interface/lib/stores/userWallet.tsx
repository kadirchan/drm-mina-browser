import { create } from "zustand";

interface UserState {
    isConnected: boolean;
    isConnecting: boolean;
    userPublicKey?: string;
    userMinaBalance: number;
    wishlist: number[];
    library: number[];

    setConnected: (connected: boolean) => void;
    setConnecting: (connecting: boolean) => void;
    setUserPublicKey: (publicKey: string) => void;
    setUserMinaBalance: (balance: number) => void;
    setWishlist: (wishlist: number[]) => void;
    setLibrary: (library: number[]) => void;
    disconnect: () => void;
}

export const useUserStore = create<UserState>()((set) => ({
    isConnected: false,
    isConnecting: false,
    userPublicKey: "",
    userMinaBalance: 0,
    wishlist: [],
    library: [],

    setConnected: (connected) => set({ isConnected: connected }),
    setConnecting: (connecting) => set({ isConnecting: connecting }),
    setUserPublicKey: (publicKey) => set({ userPublicKey: publicKey }),
    setUserMinaBalance: (balance) => set({ userMinaBalance: balance }),
    setWishlist: (wishlist) => set({ wishlist }),
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

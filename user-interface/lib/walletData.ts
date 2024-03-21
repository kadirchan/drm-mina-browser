interface WalletData {
    address: string | undefined;
    minaBalance: bigint;
    acquiredGames: string[];
}

class WalletAccount {
    private static walletData: WalletData = {
        address: undefined,
        minaBalance: BigInt(0),
        acquiredGames: [],
    };

    static getWalletData(): WalletData {
        return WalletAccount.walletData;
    }

    static setWalletData(walletData: WalletData) {
        WalletAccount.walletData = walletData;
    }

    static setAddress(address: string) {
        WalletAccount.walletData.address = address;
    }

    static setMinaBalance(minaBalance: bigint) {
        WalletAccount.walletData.minaBalance = minaBalance;
    }

    static setAcquiredGames(acquiredGames: string[]) {
        WalletAccount.walletData.acquiredGames = acquiredGames;
    }

    static disconnect() {
        WalletAccount.walletData.address = undefined;
        WalletAccount.walletData.minaBalance = BigInt(0);
        WalletAccount.walletData.acquiredGames = [];
    }
}

export default WalletAccount;

import { Field, Mina, PublicKey, fetchAccount } from "o1js";

import type { GameToken } from "../../contracts/build/src/GameTokenContract";
import type { DRM } from "../../contracts/build/src/DRMproof";
import type { ValidateDevice } from "../../contracts/build/src/DRMproof.js";

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

type VerificationKey = {
    data: string;
    hash: Field;
};

const state = {
    status: "loading" as "loading" | "ready",
    GameToken: null as null | typeof GameToken,
    DRM: null as null | typeof DRM,
    // ValidateDevice: null as null | typeof ValidateDevice,
    GameTokenVK: null as VerificationKey | null,
    DRMVK: null as VerificationKey | null,
    GameTokenInstance: null as GameToken | null,
    DRMInstance: null as DRM | null,
    transaction: null as Transaction | null,
};

const functions = {
    setActiveInstanceToBerkeley: async (args: {}) => {
        const Berkeley = Mina.Network("https://api.minascan.io/node/berkeley/v1/graphql");
        console.log("Berkeley Instance Created");
        Mina.setActiveInstance(Berkeley);
    },
    loadContracts: async (args: {}) => {
        console.log("Loading contracts");
        const { GameToken } = await import("../../contracts/build/src/GameTokenContract.js");
        const ValidateDevice = await import("../../contracts/build/src/DRMproof.js");
        // const { DRM } = await import("../../contracts/build/src/DRMproof.js");
        state.GameToken = GameToken;
        // state.DRM = DRM;
        console.log("Contracts loaded");
    },
    compileContracts: async (args: {}) => {
        console.log("Compiling contracts");
        if (
            state.GameToken === null
            // || state.DRM === null
        ) {
            throw new Error("Contracts not loaded");
        }
        const gameToken = await state.GameToken.compile();
        // const drm = await state.DRM.compile();
        state.GameTokenVK = gameToken.verificationKey;
        // state.DRMVK = drm.verificationKey;
        state.status = "ready";
        console.log("Contracts compiled");
    },
    fetchAccount: async (args: { publicKey58: string }) => {
        const publicKey = PublicKey.fromBase58(args.publicKey58);
        return await fetchAccount({ publicKey });
    },
    getBalance: async (args: { publicKey58: string; tokenId?: string }) => {
        try {
            const publicKey = PublicKey.fromBase58(args.publicKey58);
            const tokenId = args.tokenId ? Field.from(args.tokenId) : undefined;
            const res = await fetchAccount({ publicKey: args.publicKey58 });
            if (res.error) {
                throw new Error("Account not found");
            }
            const balance = Mina.getBalance(publicKey, tokenId).toBigInt();
            return Number(balance);
        } catch (error) {
            console.log(error);
            return;
        }
    },
    initZkAppInstance: async (args: { gameTokenPublicKey: string; drmPublicKey: string }) => {
        const gameToken = PublicKey.fromBase58(args.gameTokenPublicKey);
        const drm = PublicKey.fromBase58(args.drmPublicKey);
        state.GameTokenInstance = new state.GameToken!(gameToken);
        state.DRMInstance = new state.DRM!(drm);
    },
    checkGameBalance: async (args: { publicKey58: string; tokenId?: string }) => {
        const publicKey = PublicKey.fromBase58(args.publicKey58);
        const tokenId = args.tokenId
            ? Field.from(args.tokenId)
            : state.GameTokenInstance?.deriveTokenId();
        return Number(Mina.getBalance(publicKey, tokenId));
    },
    mintGameToken: async (args: { publicKey58: string }) => {
        const publicKey = PublicKey.fromBase58(args.publicKey58);
        const txn = await Mina.transaction(publicKey, () => {
            state.GameTokenInstance!.mintGameToken(publicKey);
        });
        // await txn.prove();
        state.transaction = txn;
    },
    proveTransaction: async (args: {}) => {
        if (state.transaction === null) {
            throw new Error("No transaction to prove");
        }
        await state.transaction.prove();
    },
    getTransactionJSON: async (args: {}) => {
        return state.transaction!.toJSON();
    },
};
export type WorkerFunctions = keyof typeof functions;

export type ZkappWorkerRequest = {
    id: number;
    fn: WorkerFunctions;
    args: any;
};

export type ZkappWorkerReponse = {
    id: number;
    data: any;
};

if (typeof window !== "undefined") {
    addEventListener("message", async (event: MessageEvent<ZkappWorkerRequest>) => {
        const returnData = await functions[event.data.fn](event.data.args);

        const message: ZkappWorkerReponse = {
            id: event.data.id,
            data: returnData,
        };
        postMessage(message);
    });
}

console.log("Web Worker Successfully Initialized.");

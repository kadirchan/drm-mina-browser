import { Field, Mina, PublicKey, fetchAccount } from "o1js";
import { expose } from "comlink";

import type { GameToken } from "../../contracts/src/GameTokenContract";
import type { DRM } from "../../contracts/src/DRMproof";

type VerificationKey = {
    data: string;
    hash: Field;
};

const ContractState: {
    status: "loading" | "ready";
    gameToken: VerificationKey | undefined;
    drm: VerificationKey | undefined;
} = {
    status: "loading",
    gameToken: undefined,
    drm: undefined,
};

// (async () => {
//     console.log("Loading contracts");
//     const { GameToken } = await import("../../contracts/build/src/GameTokenContract.js");
//     const { DRM } = await import("../../contracts/build/src/DRMproof.js");
//     console.log("Contracts compiling");

//     const gameToken = await GameToken.compile();
//     const drm = await DRM.compile();
//     console.log("Contracts compiled");

//     const gameTokenKey = gameToken.verificationKey;
//     const drmKey = drm.verificationKey;

//     ContractState.gameToken = gameTokenKey;
//     ContractState.drm = drmKey;
//     ContractState.status = "ready";
//     console.log("Verification keys loaded");
//     postMessage({ type: "CONTRACTS_COMPILED", payload: { gameTokenKey, drmKey } });
// })();

Mina.setActiveInstance(Mina.Network("https://api.minascan.io/node/berkeley/v1/graphql"));

const worker = {
    async getBalance(props: { address: string; tokenId?: string }): Promise<bigint | undefined> {
        try {
            const publicKey = PublicKey.fromBase58(props.address);
            const tokenId = props.tokenId ? Field.from(props.tokenId) : undefined;
            await fetchAccount({ publicKey: props.address });
            const balance = Mina.getBalance(publicKey, tokenId);
            return balance.toBigInt();
        } catch (error) {
            console.log(error);
            return;
        }
    },
};

expose(worker);

export type WebWorker = typeof worker;

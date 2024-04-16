import { fetchAccount, PublicKey, Field } from "o1js";

import type { ZkappWorkerRequest, ZkappWorkerReponse, WorkerFunctions } from "./drmWorker";

export default class DRMWorkerClient {
    setActiveInstanceToBerkeley() {
        return this._call("setActiveInstanceToBerkeley", {});
    }

    loadContracts() {
        return this._call("loadContracts", {});
    }

    compileContracts() {
        return this._call("compileContracts", {});
    }

    fetchAccount({ publicKey }: { publicKey: string }): ReturnType<typeof fetchAccount> {
        const result = this._call("fetchAccount", {
            publicKey58: publicKey, //.toBase58(),
        });
        return result as ReturnType<typeof fetchAccount>;
    }

    async getBalance({
        publicKey,
        tokenId,
    }: {
        publicKey: string;
        tokenId?: string;
    }): Promise<number> {
        const balance = await this._call("getBalance", {
            publicKey58: publicKey,
            tokenId,
        });
        return balance as number;
    }

    initZkAppInstance({
        gameTokenPublicKey,
        drmPublicKey,
    }: {
        gameTokenPublicKey: PublicKey;
        drmPublicKey: PublicKey;
    }) {
        return this._call("initZkAppInstance", {
            gameTokenPublicKey: gameTokenPublicKey.toBase58(),
            drmPublicKey: drmPublicKey.toBase58(),
        });
    }

    async checkGameBalance({
        publicKey,
        tokenId,
    }: {
        publicKey: PublicKey;
        tokenId?: Field;
    }): Promise<number> {
        const result = await this._call("checkGameBalance", {
            publicKey58: publicKey.toBase58(),
            tokenId: tokenId?.toString(),
        });
        return result as number;
    }

    mintGameToken({ publicKey }: { publicKey: PublicKey }) {
        return this._call("mintGameToken", {
            publicKey58: publicKey.toBase58(),
        });
    }

    proveTransaction() {
        return this._call("proveTransaction", {});
    }

    getTransactionJSON() {
        return this._call("getTransactionJSON", {});
    }

    worker: Worker;

    promises: {
        [id: number]: { resolve: (res: any) => void; reject: (err: any) => void };
    };

    nextId: number;

    constructor() {
        this.worker = new Worker(new URL("./drmWorker.ts", import.meta.url));
        this.promises = {};
        this.nextId = 0;

        this.worker.onmessage = (event: MessageEvent<ZkappWorkerReponse>) => {
            this.promises[event.data.id].resolve(event.data.data);
            delete this.promises[event.data.id];
        };
    }

    _call(fn: WorkerFunctions, args: any) {
        return new Promise((resolve, reject) => {
            this.promises[this.nextId] = { resolve, reject };

            const message: ZkappWorkerRequest = {
                id: this.nextId,
                fn,
                args,
            };

            this.worker.postMessage(message);

            this.nextId++;
        });
    }
}

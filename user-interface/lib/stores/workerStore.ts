import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import DRMWorkerClient from "../drmWorkerClient";
import { PublicKey } from "o1js";

interface WorkerStoreState {
    status: number;
    worker?: DRMWorkerClient;
    startWorker: () => Promise<DRMWorkerClient>;
    // fetchWalletAccount: (args: { publicKey58: string }) => Promise<number>;
}

async function timeout(seconds: number): Promise<void> {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, seconds * 1000);
    });
}

export const useWorkerStore = create<WorkerStoreState, [["zustand/immer", never]]>(
    immer((set) => ({
        status: 0,
        async startWorker() {
            console.log("Worker starting");
            const worker = new DRMWorkerClient();

            await timeout(5);

            await worker.setActiveInstanceToBerkeley();

            set((state) => {
                state.status = 1;
                state.worker = worker;
            });

            await worker.loadContracts();

            set((state) => {
                state.status = 2;
            });

            await worker.compileContracts();

            set((state) => {
                state.status = 3;
            });

            return worker;
        },
        // async fetchWalletAccount({ publicKey58 }) {
        //     if (!this.worker) {
        //         throw new Error("Worker not started");
        //     }
        //     const publicKey = PublicKey.fromBase58(publicKey58);
        //     const account = await this.worker.fetchAccount({ publicKey });
        //     return Number(account.account.balance) || 0;
        // },
    }))
);

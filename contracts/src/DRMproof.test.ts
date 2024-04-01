import { DRM } from './DRMproof.js';
import { GameToken } from './GameTokenContract.js';

import {
  Field,
  Mina,
  PrivateKey,
  AccountUpdate,
  UInt64,
  Account,
  Provable,
  MerkleMap,
  Signature,
  Poseidon,
} from 'o1js';
import { mockIdentifiers } from './mock.js';
import { Identifiers, RawIdentifiers } from './Identifiers.js';

const proofsEnabled = false;

describe('GameToken', () => {
  const Local = Mina.LocalBlockchain({ proofsEnabled });
  Mina.setActiveInstance(Local);

  const deployer = Local.testAccounts[0];
  const alice = Local.testAccounts[1];
  const bob = Local.testAccounts[2];

  const GameTokenKey = PrivateKey.random();
  const GameTokenAddr = GameTokenKey.toPublicKey();

  const GameTokenInstance = new GameToken(GameTokenAddr);

  const drmContractKey = PrivateKey.random();
  const drmContractAddr = drmContractKey.toPublicKey();
  const drmContractInstance = new DRM(drmContractAddr);

  const Tree = new MerkleMap();

  beforeAll(async () => {
    if (proofsEnabled) {
      await GameToken.compile();
    }
  });

  it('deploys GameToken', async () => {
    const tokenDeployTxn = await Mina.transaction(deployer.publicKey, () => {
      AccountUpdate.fundNewAccount(deployer.publicKey);
      GameTokenInstance.deploy({ zkappKey: GameTokenKey });
    });

    await tokenDeployTxn.prove();
    await tokenDeployTxn.sign([deployer.privateKey]).send();
  });

  it('deploys DRM', async () => {
    const drmDeployTxn = await Mina.transaction(deployer.publicKey, () => {
      AccountUpdate.fundNewAccount(deployer.publicKey);
      drmContractInstance.deploy({ zkappKey: drmContractKey });
    });

    await drmDeployTxn.prove();
    await drmDeployTxn.sign([deployer.privateKey]).send();
  });

  it('Deployer set game token address and root', async () => {
    const setDrmTxn = await Mina.transaction(deployer.publicKey, () => {
      drmContractInstance.setGameTokenAddress(GameTokenAddr);
      drmContractInstance.setDeviceRoot(Tree.getRoot());
    });

    await setDrmTxn.prove();
    await setDrmTxn.sign([deployer.privateKey]).send();

    expect(drmContractInstance.getRoot()).toEqual(Tree.getRoot());
    expect(drmContractInstance.gameTokenAddress.getAndRequireEquals()).toEqual(
      GameTokenAddr
    );
  });

  it('Alice buys game token', async () => {
    const mintTxn = await Mina.transaction(alice.publicKey, () => {
      AccountUpdate.fundNewAccount(alice.publicKey);
      GameTokenInstance.mintGameToken(alice.publicKey);
    });
    await mintTxn.prove();
    await mintTxn.sign([alice.privateKey]).send();

    expect(
      Mina.getBalance(
        alice.publicKey,
        GameTokenInstance.deriveTokenId()
      ).toBigInt()
    ).toEqual(1n);
  });

  const AliceDeviceRaw = mockIdentifiers[0];
  const AliceDeviceIdentifiers = Identifiers.fromRaw(AliceDeviceRaw);
  const AliceDeviceHash = AliceDeviceIdentifiers.hash();
  const AliceSignature = Signature.create(alice.privateKey, [AliceDeviceHash]);

  const BobDeviceRaw = mockIdentifiers[1];
  const BobDeviceIdentifiers = Identifiers.fromRaw(BobDeviceRaw);
  const BobDeviceHash = BobDeviceIdentifiers.hash();

  let previousRoot = Tree.getRoot();
  let previousValue = Tree.get(Poseidon.hash(alice.publicKey.toFields()));

  Tree.set(Poseidon.hash(alice.publicKey.toFields()), AliceDeviceHash);
  let newRoot = Tree.getRoot();
  let newValue = Tree.get(Poseidon.hash(alice.publicKey.toFields()));

  let AliceWitness = Tree.getWitness(Poseidon.hash(alice.publicKey.toFields()));

  //   const rootBeforeCall = drmContractInstance.getRoot();

  it('Alice updates device', async () => {
    const updateTxn = await Mina.transaction(alice.publicKey, () => {
      drmContractInstance.addDevice(
        alice.publicKey,
        previousValue,
        AliceDeviceIdentifiers,
        AliceWitness,
        AliceSignature
      );
    });

    await updateTxn.prove();
    await updateTxn.sign([alice.privateKey]).send();

    const rootAfterCall = drmContractInstance.getRoot();
    expect(rootAfterCall).toEqual(newRoot);
  });
});

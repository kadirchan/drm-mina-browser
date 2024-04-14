import { DRM, SessionPublicInput, ValidateDevice } from './DRMproof.js';
import { GameToken } from './GameTokenContract.js';

import {
  Field,
  Mina,
  PrivateKey,
  AccountUpdate,
  MerkleMap,
  Signature,
  Poseidon,
} from 'o1js';
import { mockIdentifiers } from './mock.js';
import { Identifiers } from './Identifiers.js';

const proofsEnabled = false;

describe('GameToken', () => {
  const Local = Mina.LocalBlockchain({ proofsEnabled });
  Mina.setActiveInstance(Local);

  const deployer = Local.testAccounts[0];
  const alice = Local.testAccounts[1];

  const GameTokenKey = PrivateKey.random();
  const GameTokenAddr = GameTokenKey.toPublicKey();

  const GameTokenInstance = new GameToken(GameTokenAddr);

  const drmContractKey = PrivateKey.random();
  const drmContractAddr = drmContractKey.toPublicKey();
  const drmContractInstance = new DRM(drmContractAddr);

  const deviceTree = new MerkleMap();
  const sessionTree = new MerkleMap();

  beforeAll(async () => {
    await ValidateDevice.compile();
    if (proofsEnabled) {
      await GameToken.compile();
      await DRM.compile();
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
      drmContractInstance.setDeviceRoot(deviceTree.getRoot());
      drmContractInstance.setSessionRoot(sessionTree.getRoot());
    });

    await setDrmTxn.prove();
    await setDrmTxn.sign([deployer.privateKey]).send();

    expect(drmContractInstance.getDeviceRoot()).toEqual(deviceTree.getRoot());
    expect(drmContractInstance.getSessionRoot()).toEqual(sessionTree.getRoot());
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

  it('Alice updates device', async () => {
    const AliceDeviceRaw = mockIdentifiers[0];
    const AliceDeviceIdentifiers = Identifiers.fromRaw(AliceDeviceRaw);
    const AliceDeviceHash = AliceDeviceIdentifiers.hash();
    const AliceSignature = Signature.create(alice.privateKey, [
      AliceDeviceHash,
    ]);

    let previousValue = deviceTree.get(
      Poseidon.hash(alice.publicKey.toFields())
    );
    deviceTree.set(Poseidon.hash(alice.publicKey.toFields()), AliceDeviceHash);
    let AliceWitness = deviceTree.getWitness(
      Poseidon.hash(alice.publicKey.toFields())
    );

    const sessionWitness = sessionTree.getWitness(AliceDeviceHash);

    const updateTxn = await Mina.transaction(alice.publicKey, () => {
      drmContractInstance.addDevice(
        alice.publicKey,
        previousValue,
        AliceDeviceIdentifiers,
        AliceWitness,
        AliceSignature,
        sessionWitness
      );
    });

    await updateTxn.prove();
    await updateTxn.sign([alice.privateKey]).send();

    sessionTree.set(AliceDeviceHash, Field.from(1));
    const deviceRootAfterCall = drmContractInstance.getDeviceRoot();
    expect(deviceRootAfterCall).toEqual(
      AliceWitness.computeRootAndKey(AliceDeviceHash)[0]
    );

    const sessionRootAfterCall = drmContractInstance.getSessionRoot();
    expect(sessionRootAfterCall).toEqual(sessionTree.getRoot());
  });

  it('Alice create new session for game', async () => {
    const AliceDeviceRaw = mockIdentifiers[0];
    const AliceDeviceIdentifiers = Identifiers.fromRaw(AliceDeviceRaw);
    const AliceDeviceHash = AliceDeviceIdentifiers.hash();

    // random session id
    const newSessionValue = Field.from(Math.floor(Math.random() * 100000) + 2);
    const sessionWitness = sessionTree.getWitness(AliceDeviceHash);
    const deviceMerkleRoot = deviceTree.getRoot();
    const sessionMerkleRoot = sessionTree.getRoot();
    const deviceWitness = deviceTree.getWitness(
      Poseidon.hash(alice.publicKey.toFields())
    );

    const publicInput = new SessionPublicInput({
      deviceMerkleRoot: deviceMerkleRoot,
      deviceMerkleWitness: deviceWitness,
      sessionMerkleRoot: sessionMerkleRoot,
    });

    const proof = await ValidateDevice.proofForSession(
      publicInput,
      AliceDeviceIdentifiers
    );

    const createSessionTxn = await Mina.transaction(deployer.publicKey, () => {
      drmContractInstance.createSession(
        sessionWitness,
        Field.from(1),
        newSessionValue,
        proof
      );
    });

    await createSessionTxn.prove();
    await createSessionTxn.sign([deployer.privateKey]).send();

    const sessionRootAfterCall = drmContractInstance.getSessionRoot();
    sessionTree.set(AliceDeviceHash, newSessionValue);
    expect(sessionRootAfterCall).toEqual(sessionTree.getRoot());
  });
});

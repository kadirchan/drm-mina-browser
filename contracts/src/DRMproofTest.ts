import {
  AccountUpdate,
  MerkleMap,
  Mina,
  Poseidon,
  PrivateKey,
  PublicKey,
  Signature,
  TokenId,
  UInt64,
} from 'o1js';
import { GameToken } from './GameTokenContract.js';
import { mockIdentifiers } from './mock.js';
import { Identifiers, RawIdentifiers } from './Identifiers.js';
import { DRM } from './DRMproof.js';

const proofsEnabled = false;
(async () => {
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

  if (proofsEnabled) {
    await GameToken.compile();
    await DRM.compile();
  }

  const printState = () => {
    const getBalance = (address: PublicKey, tokenAddress?: PublicKey) => {
      try {
        if (tokenAddress == null) {
          return Mina.getBalance(address).toBigInt();
        } else {
          return Mina.getBalance(
            address,
            TokenId.derive(tokenAddress)
          ).toBigInt();
        }
      } catch (error) {
        return null;
      }
    };

    console.log('\tdeployer MINA:', getBalance(deployer.publicKey));
    console.log(
      '\tdeployer GameToken:',
      getBalance(deployer.publicKey, GameTokenAddr)
    );

    console.log('\talice MINA:', getBalance(alice.publicKey));
    console.log(
      '\talice GameToken:',
      getBalance(alice.publicKey, GameTokenAddr)
    );

    console.log('\tbob MINA:', getBalance(bob.publicKey));
    console.log('\tbob GameToken:', getBalance(bob.publicKey, GameTokenAddr));

    console.log('\ttoken contract MINA:', getBalance(GameTokenAddr));
    console.log(
      '\ttoken contract GameToken:',
      getBalance(GameTokenAddr, GameTokenAddr)
    );
  };

  console.log('Token Contract Address: ', GameTokenAddr.toJSON());
  console.log('Token:', TokenId.derive(GameTokenAddr).toJSON());

  printState();

  // ----------------------------------------------------------------------------

  const tokenDeployTxn = await Mina.transaction(deployer.publicKey, () => {
    AccountUpdate.fundNewAccount(deployer.publicKey);
    GameTokenInstance.deploy({ zkappKey: GameTokenKey });
  });

  await tokenDeployTxn.prove();
  await tokenDeployTxn.sign([deployer.privateKey]).send();

  console.log('Token Deployed');

  const drmDeployTxn = await Mina.transaction(deployer.publicKey, () => {
    AccountUpdate.fundNewAccount(deployer.publicKey);
    drmContractInstance.deploy({ zkappKey: drmContractKey });
  });

  await drmDeployTxn.prove();
  await drmDeployTxn.sign([deployer.privateKey]).send();

  console.log('DRM Deployed');

  const setDrmTxn = await Mina.transaction(deployer.publicKey, () => {
    drmContractInstance.setGameTokenAddress(GameTokenAddr);
    drmContractInstance.setDeviceRoot(Tree.getRoot());
  });

  await setDrmTxn.prove();
  await setDrmTxn.sign([deployer.privateKey]).send();

  console.log('DRM Set');

  printState();
  // ----------------------------------------------------------------------------

  const mintTxn = await Mina.transaction(alice.publicKey, () => {
    AccountUpdate.fundNewAccount(alice.publicKey);
    GameTokenInstance.mintGameToken(alice.publicKey);
  });
  await mintTxn.prove();
  await mintTxn.sign([alice.privateKey]).send();

  printState();

  // const balanceTxn = await Mina.transaction(alice.publicKey, () => {
  //   const balance = GameTokenInstance.getBalance(alice.publicKey);
  //   console.log('Alice balance:', balance);
  // });
  // ----------------------------------------------------------------------------

  const AliceDeviceRaw = mockIdentifiers[0];
  const AliceDeviceIdentifiers = Identifiers.fromRaw(AliceDeviceRaw);
  const AliceDeviceHash = AliceDeviceIdentifiers.hash();
  const AliceSignature = Signature.create(alice.privateKey, [AliceDeviceHash]);

  const BobDeviceRaw = mockIdentifiers[1];
  const BobDeviceIdentifiers = Identifiers.fromRaw(BobDeviceRaw);
  const BobDeviceHash = BobDeviceIdentifiers.hash();

  let previousRoot = Tree.getRoot();
  let previousValue = Tree.get(Poseidon.hash(alice.publicKey.toFields()));
  console.log('previous Value', previousValue.value);

  Tree.set(Poseidon.hash(alice.publicKey.toFields()), AliceDeviceHash);
  let newRoot = Tree.getRoot();
  let newValue = Tree.get(Poseidon.hash(alice.publicKey.toFields()));

  let AliceWitness = Tree.getWitness(Poseidon.hash(alice.publicKey.toFields()));

  const rootBeforeCall = drmContractInstance.getDeviceRoot();
  console.log('Root before call: ', rootBeforeCall.toString());

  const sessionTree = new MerkleMap();
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

  const rootAfterCall = drmContractInstance.getDeviceRoot();
  console.log('Root after call: ', rootAfterCall.toString());

  printState();

  // ----------------------------------------------------------------------------
  /*
  const BobSignature = Signature.create(bob.privateKey, [BobDeviceHash]);

  previousRoot = Tree.getRoot();
  previousValue = Tree.get(Poseidon.hash(bob.publicKey.toFields()));

  Tree.set(Poseidon.hash(bob.publicKey.toFields()), BobDeviceHash);

  newRoot = Tree.getRoot();
  newValue = Tree.get(Poseidon.hash(bob.publicKey.toFields()));

  const BobWitness = Tree.getWitness(Poseidon.hash(bob.publicKey.toFields()));

  const rootBeforeCallBob = drmContractInstance.getRoot();
  console.log('Root before call Bob: ', rootBeforeCallBob.toString());

  const updateTxnBob = await Mina.transaction(bob.publicKey, () => {
    drmContractInstance.addDevice(
      bob.publicKey,
      previousValue,
      BobDeviceIdentifiers,
      BobWitness,
      BobSignature
    );
  });

  await updateTxnBob.prove();
  await updateTxnBob.sign([bob.privateKey]).send();

  const rootAfterCallBob = drmContractInstance.getRoot();
  console.log('Root after call Bob: ', rootAfterCallBob.toString());
  
  */
})();

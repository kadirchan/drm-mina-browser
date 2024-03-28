import {
  AccountUpdate,
  MerkleMap,
  Mina,
  Poseidon,
  PrivateKey,
  PublicKey,
  TokenId,
  UInt64,
} from 'o1js';
import { GameToken } from './GameTokenContract.js';
import { mockIdentifiers } from './mock.js';
import { Identifiers, RawIdentifiers } from './Identifiers.js';
import { DeviceMapTransition, MapUpdate } from './DRMproof.js';

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

  if (proofsEnabled) {
    await GameToken.compile();
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

  const deployTxn = await Mina.transaction(deployer.publicKey, () => {
    AccountUpdate.fundNewAccount(deployer.publicKey);
    GameTokenInstance.deploy({ zkappKey: GameTokenKey });
  });

  await deployTxn.prove();
  await deployTxn.sign([deployer.privateKey]).send();

  console.log('Deployed');

  printState();

  // ----------------------------------------------------------------------------

  const mintTxn = await Mina.transaction(alice.publicKey, () => {
    AccountUpdate.fundNewAccount(alice.publicKey);
    GameTokenInstance.mintGameToken(alice.publicKey);
  });
  await mintTxn.prove();
  await mintTxn.sign([alice.privateKey]).send();

  printState();

  // ----------------------------------------------------------------------------

  const AliceDeviceRaw = mockIdentifiers[0];
  const AliceDeviceIdentifiers = Identifiers.fromRaw(AliceDeviceRaw);
  const AliceDeviceHash = AliceDeviceIdentifiers.hash();

  const BobDeviceRaw = mockIdentifiers[1];
  const BobDeviceIdentifiers = Identifiers.fromRaw(BobDeviceRaw);
  const BobDeviceHash = BobDeviceIdentifiers.hash();

  const Tree = new MerkleMap();
  let previousRoot = Tree.getRoot();
  let previousValue = Tree.get(Poseidon.hash(alice.publicKey.toFields()));

  Tree.set(Poseidon.hash(alice.publicKey.toFields()), AliceDeviceHash);
  let newRoot = Tree.getRoot();
  let newValue = Tree.get(Poseidon.hash(alice.publicKey.toFields()));

  let AliceWitness = Tree.getWitness(Poseidon.hash(alice.publicKey.toFields()));

  const AliceMapUpdate = MapUpdate.fromFields([
    previousRoot,
    newRoot,
    Poseidon.hash(alice.publicKey.toFields()),
    previousValue,
    newValue,
    ...AliceWitness.toFields(),
  ]);

  const AliceTransition = DeviceMapTransition.create(
    alice.publicKey,
    AliceMapUpdate
  );

  console.log('Alice Transition created');
})();

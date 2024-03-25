import {
  AccountUpdate,
  Mina,
  PrivateKey,
  PublicKey,
  TokenId,
  UInt64,
} from 'o1js';
import { GameToken } from './GameTokenWrapped.js';

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

    console.log('alice MINA:', getBalance(alice.publicKey));
    console.log('alice GameToken:', getBalance(alice.publicKey, GameTokenAddr));

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
  await deployTxn.sign([deployer.privateKey, GameTokenKey]).send();

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
})();

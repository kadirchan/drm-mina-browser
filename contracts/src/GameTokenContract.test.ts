import { GameToken } from './GameTokenContract.js';

import {
  Field,
  Mina,
  PrivateKey,
  AccountUpdate,
  UInt64,
  Account,
  Provable,
} from 'o1js';

const proofsEnabled = false;

describe('GameToken', () => {
  const Local = Mina.LocalBlockchain({ proofsEnabled });
  Mina.setActiveInstance(Local);
  const { privateKey: deployerKey, publicKey: deployerAccount } =
    Local.testAccounts[0];

  const { privateKey: aliceKey, publicKey: aliceAccount } =
    Local.testAccounts[1];
  const { privateKey: bobKey, publicKey: bobAccount } = Local.testAccounts[2];
  const GameTokenSk = PrivateKey.random();
  const GameTokenAddr = GameTokenSk.toPublicKey();

  const GameTokenInstance = new GameToken(GameTokenAddr);
  beforeAll(async () => {
    if (proofsEnabled) {
      await GameToken.compile();
    }
  });

  it('deploys GameTokenApp', async () => {
    const deployTxn = await Mina.transaction(deployerAccount, () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      GameTokenInstance.deploy({ zkappKey: GameTokenSk });
    });
    await deployTxn.sign([deployerKey, GameTokenSk]).send();
  });

  it('mints GameToken', async () => {
    const mintTxn = await Mina.transaction(deployerAccount, () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      GameTokenInstance.mintGameToken();
    });
    await mintTxn.prove();
    await mintTxn.sign([deployerKey]).send();
  });
  it('Alice can buy GameToken', async () => {
    try {
      console.log(
        'Alice token balance: ',
        Mina.getBalance(aliceAccount, GameTokenInstance.token.id).toString()
      );
    } catch (e) {
      console.log('Alice dont have token yet');
    }

    const buyTxn = await Mina.transaction(aliceAccount, () => {
      AccountUpdate.fundNewAccount(aliceAccount);
      GameTokenInstance.buyGameToken();
    });
    await buyTxn.prove();
    await buyTxn.sign([aliceKey, GameTokenSk]).send();

    expect(
      Mina.getBalance(aliceAccount, GameTokenInstance.token.id).value.toBigInt()
    ).toEqual(1n);
  });

  it('Alice try to buy GameToken again', async () => {
    try {
      const buyTxn = await Mina.transaction(aliceAccount, () => {
        AccountUpdate.fundNewAccount(aliceAccount);
        GameTokenInstance.buyGameToken();
      });
      await buyTxn.prove();
      await buyTxn.sign([aliceKey, GameTokenSk]).send();
      throw new Error('Alice should not be able to buy token again');
    } catch (e) {
      console.log('Alice already have token');
    }
  });

  it('Bob can buy GameToken', async () => {
    try {
      console.log(
        'Bob token balance: ',
        Mina.getBalance(bobAccount, GameTokenInstance.token.id).toString()
      );
    } catch (e) {
      console.log('Bob dont have token yet');
    }

    const buyTxn = await Mina.transaction(bobAccount, () => {
      AccountUpdate.fundNewAccount(bobAccount);
      GameTokenInstance.buyGameToken();
    });
    await buyTxn.prove();
    await buyTxn.sign([bobKey, GameTokenSk]).send();

    expect(
      Mina.getBalance(bobAccount, GameTokenInstance.token.id).value.toBigInt()
    ).toEqual(1n);
  });

  it('Publisher can set game price', async () => {
    const price = UInt64.from(1000);
    const setPriceTxn = await Mina.transaction(deployerAccount, () => {
      GameTokenInstance.setGamePrice(price);
    });
    await setPriceTxn.prove();
    await setPriceTxn.sign([deployerKey]).send();
    expect(GameTokenInstance.gamePrice.get()).toEqual(price);
  });

  it('Publisher can set discount', async () => {
    const discount = UInt64.from(100);
    const setDiscountTxn = await Mina.transaction(deployerAccount, () => {
      GameTokenInstance.setDiscount(discount);
    });
    await setDiscountTxn.prove();
    await setDiscountTxn.sign([deployerKey]).send();
    expect(GameTokenInstance.discount.get()).toEqual(discount);
  });

  it('Publisher can set timeout interval', async () => {
    const interval = UInt64.from(100);
    const setTimeoutTxn = await Mina.transaction(deployerAccount, () => {
      GameTokenInstance.setTimeoutInterval(interval);
    });
    await setTimeoutTxn.prove();
    await setTimeoutTxn.sign([deployerKey]).send();
    expect(GameTokenInstance.timeoutInterval.get()).toEqual(interval);
  });

  it('Alice can not set game price', async () => {
    const price = UInt64.from(1000);
    try {
      const setPriceTxn = await Mina.transaction(aliceAccount, () => {
        GameTokenInstance.setGamePrice(price);
      });
      await setPriceTxn.prove();
      await setPriceTxn.sign([aliceKey]).send();
      throw new Error('Alice should not be able to set game price');
    } catch (e) {
      console.log('Alice can not set game price');
    }
  });

  it('Alice can not set discount', async () => {
    const discount = UInt64.from(100);
    try {
      const setDiscountTxn = await Mina.transaction(aliceAccount, () => {
        GameTokenInstance.setDiscount(discount);
      });
      await setDiscountTxn.prove();
      await setDiscountTxn.sign([aliceKey]).send();
      throw new Error('Alice should not be able to set discount');
    } catch (e) {
      console.log('Alice can not set discount');
    }
  });

  it('Alice can not set timeout interval', async () => {
    const interval = UInt64.from(100);
    try {
      const setTimeoutTxn = await Mina.transaction(aliceAccount, () => {
        GameTokenInstance.setTimeoutInterval(interval);
      });
      await setTimeoutTxn.prove();
      await setTimeoutTxn.sign([aliceKey]).send();
      throw new Error('Alice should not be able to set timeout interval');
    } catch (e) {
      console.log('Alice can not set timeout interval');
    }
  });
});

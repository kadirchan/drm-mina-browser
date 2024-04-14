import { GameToken } from './GameTokenContract.js';

import { Mina, PrivateKey, AccountUpdate, UInt64 } from 'o1js';

const proofsEnabled = false;

describe('GameToken', () => {
  const GAMEPRICE = 1000;
  const DISCOUNT = 100;
  const TIMEOUTINTERVAL = 100;
  const MAXTREEHEIGHT = 2;

  const Local = Mina.LocalBlockchain({ proofsEnabled });
  Mina.setActiveInstance(Local);
  const deployer = Local.testAccounts[0];
  const alice = Local.testAccounts[1];
  const bob = Local.testAccounts[2];

  const GameTokenSk = PrivateKey.random();
  const GameTokenAddr = GameTokenSk.toPublicKey();

  const GameTokenInstance = new GameToken(GameTokenAddr);

  beforeAll(async () => {
    if (proofsEnabled) {
      await GameToken.compile();
    }
  });

  it('deploys GameTokenApp', async () => {
    const deployTxn = await Mina.transaction(deployer.publicKey, () => {
      AccountUpdate.fundNewAccount(deployer.publicKey);
      GameTokenInstance.deploy({ zkappKey: GameTokenSk });
    });

    await deployTxn.prove();
    await deployTxn.sign([deployer.privateKey, GameTokenSk]).send();
  });

  it('deployer set contract states', async () => {
    const setPriceTxn = await Mina.transaction(deployer.publicKey, () => {
      GameTokenInstance.setGamePrice(UInt64.from(GAMEPRICE));
      GameTokenInstance.setDiscount(UInt64.from(DISCOUNT));
      // GameTokenInstance.setTimeoutInterval(UInt64.from(TIMEOUTINTERVAL));
      // GameTokenInstance.maxTreeHeight.set(UInt64.from(MAXTREEHEIGHT));
    });

    await setPriceTxn.prove();
    await setPriceTxn.sign([deployer.privateKey]).send();
  });

  it('Alice can buy GameToken', async () => {
    const deployerPreviousBalance = Mina.getBalance(
      deployer.publicKey
    ).toBigInt();
    // const alicePreviousBalance = Mina.getBalance(alice.publicKey).toBigInt();

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

    const deployerCurrentBalance = Mina.getBalance(
      deployer.publicKey
    ).toBigInt();

    expect(Number(deployerCurrentBalance - deployerPreviousBalance)).toEqual(
      GAMEPRICE - DISCOUNT
    );
  });

  it('Alice try to buy GameToken again', async () => {
    try {
      const mintTxn = await Mina.transaction(alice.publicKey, () => {
        GameTokenInstance.mintGameToken(alice.publicKey);
      });
      await mintTxn.prove();
      await mintTxn.sign([alice.privateKey]).send();
      throw new Error('Alice should not be able to buy token again');
    } catch (e) {
      console.log('Alice already have token');
    }
  });

  it('Bob can buy GameToken', async () => {
    const deployerPreviousBalance = Mina.getBalance(
      deployer.publicKey
    ).toBigInt();
    const mintTxn = await Mina.transaction(bob.publicKey, () => {
      AccountUpdate.fundNewAccount(bob.publicKey);
      GameTokenInstance.mintGameToken(bob.publicKey);
    });
    await mintTxn.prove();
    await mintTxn.sign([bob.privateKey]).send();

    expect(
      Mina.getBalance(
        bob.publicKey,
        GameTokenInstance.deriveTokenId()
      ).toBigInt()
    ).toEqual(1n);

    const deployerCurrentBalance = Mina.getBalance(
      deployer.publicKey
    ).toBigInt();

    expect(Number(deployerCurrentBalance - deployerPreviousBalance)).toEqual(
      GAMEPRICE - DISCOUNT
    );
  });

  it('Publisher can set game price', async () => {
    const price = UInt64.from(2000);
    const setPriceTxn = await Mina.transaction(deployer.publicKey, () => {
      GameTokenInstance.setGamePrice(price);
    });
    await setPriceTxn.prove();
    await setPriceTxn.sign([deployer.privateKey]).send();
    expect(GameTokenInstance.gamePrice.get()).toEqual(price);
  });

  it('Publisher can set discount', async () => {
    const discount = UInt64.from(200);
    const setDiscountTxn = await Mina.transaction(deployer.publicKey, () => {
      GameTokenInstance.setDiscount(discount);
    });
    await setDiscountTxn.prove();
    await setDiscountTxn.sign([deployer.privateKey]).send();
    expect(GameTokenInstance.discount.get()).toEqual(discount);
  });

  it('Publisher can set timeout interval', async () => {
    const interval = UInt64.from(200);
    const setTimeoutTxn = await Mina.transaction(deployer.publicKey, () => {
      GameTokenInstance.setTimeoutInterval(interval);
    });
    await setTimeoutTxn.prove();
    await setTimeoutTxn.sign([deployer.privateKey]).send();
    expect(GameTokenInstance.timeoutInterval.get()).toEqual(interval);
  });

  it('Publisher can set max tree height', async () => {
    const height = UInt64.from(3);
    const setHeightTxn = await Mina.transaction(deployer.publicKey, () => {
      GameTokenInstance.setMaxTreeHeight(height);
    });
    await setHeightTxn.prove();
    await setHeightTxn.sign([deployer.privateKey]).send();
    expect(UInt64.from(GameTokenInstance.maxTreeHeight.get())).toEqual(height);
  });

  it('Alice can not set game price', async () => {
    const price = UInt64.from(1500);
    try {
      const setPriceTxn = await Mina.transaction(alice.publicKey, () => {
        GameTokenInstance.setGamePrice(price);
      });
      await setPriceTxn.prove();
      await setPriceTxn.sign([alice.privateKey]).send();
      throw new Error('Alice should not be able to set game price');
    } catch (e) {
      console.log('Alice can not set game price');
    }
  });

  it('Alice can not set discount', async () => {
    const discount = UInt64.from(150);
    try {
      const setDiscountTxn = await Mina.transaction(alice.publicKey, () => {
        GameTokenInstance.setDiscount(discount);
      });
      await setDiscountTxn.prove();
      await setDiscountTxn.sign([alice.privateKey]).send();
      throw new Error('Alice should not be able to set discount');
    } catch (e) {
      console.log('Alice can not set discount');
    }
  });

  it('Alice can not set timeout interval', async () => {
    const interval = UInt64.from(150);
    try {
      const setTimeoutTxn = await Mina.transaction(alice.publicKey, () => {
        GameTokenInstance.setTimeoutInterval(interval);
      });
      await setTimeoutTxn.prove();
      await setTimeoutTxn.sign([alice.privateKey]).send();
      throw new Error('Alice should not be able to set timeout interval');
    } catch (e) {
      console.log('Alice can not set timeout interval');
    }
  });

  it('Alice can not set max tree height', async () => {
    const height = UInt64.from(2);
    try {
      const setHeightTxn = await Mina.transaction(alice.publicKey, () => {
        GameTokenInstance.setMaxTreeHeight(height);
      });
      await setHeightTxn.prove();
      await setHeightTxn.sign([alice.privateKey]).send();
      throw new Error('Alice should not be able to set max tree height');
    } catch (e) {
      console.log('Alice can not set max tree height');
    }
  });
});

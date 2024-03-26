import {
  Account,
  AccountUpdate,
  AccountUpdateForest,
  Bool,
  DeployArgs,
  Field,
  Permissions,
  Provable,
  PublicKey,
  Signature,
  SmartContract,
  State,
  Struct,
  TokenContract,
  UInt64,
  method,
  state,
} from 'o1js';

export class GameToken extends TokenContract {
  /**
   * Public key of the publisher of the game.
   */
  @state(PublicKey) publisher = State<PublicKey>();

  /**
   * Price of the game in nanoMina or other stable token.
   */
  @state(UInt64) gamePrice = State<UInt64>();

  /**
   * Discount rate for the game.
   */
  @state(UInt64) discount = State<UInt64>();

  /**
   * Timeout interval for the proof to be valid.
   */
  @state(UInt64) timeoutInterval = State<UInt64>();

  deploy(args?: DeployArgs) {
    super.deploy(args);

    this.publisher.set(this.sender);

    this.account.permissions.set({
      ...Permissions.default(),
      editState: Permissions.proof(),
      send: Permissions.impossible(),
      setTokenSymbol: Permissions.signature(),
      setZkappUri: Permissions.signature(),
    });
  }

  @method async init() {
    this.account.provedState.getAndRequireEquals().assertFalse();

    super.init();

    this.gamePrice.set(UInt64.from(33333));
    this.discount.set(UInt64.from(2121));
    this.timeoutInterval.set(UInt64.from(1000));
  }

  @method mintGameToken(to: PublicKey) {
    const price = this.gamePrice.getAndRequireEquals();
    const discount = this.discount.getAndRequireEquals();
    const publisherAddress = this.publisher.getAndRequireEquals();
    const totalPrice = price.sub(discount);

    this.account.balance.requireBetween(UInt64.zero, UInt64.MAXINT());

    const userAccount = Account(this.sender, this.deriveTokenId());
    userAccount.balance.requireEquals(UInt64.zero);

    const accountUpdate = AccountUpdate.createSigned(this.sender);
    accountUpdate.send({ to: publisherAddress, amount: totalPrice });

    this.internal.mint({
      address: to,
      amount: 1n,
    });
  }

  @method setGamePrice(price: UInt64) {
    this.onlyPublisher();
    const currentPrice = this.gamePrice.get();
    this.gamePrice.requireEquals(currentPrice);
    this.gamePrice.set(price);
  }

  @method setDiscount(discount: UInt64) {
    this.onlyPublisher();
    const currentDiscount = this.discount.get();
    this.discount.requireEquals(currentDiscount);
    this.discount.set(discount);
  }

  @method setTimeoutInterval(interval: UInt64) {
    this.onlyPublisher();
    const currentInterval = this.timeoutInterval.get();
    this.timeoutInterval.requireEquals(currentInterval);
    this.timeoutInterval.set(interval);
  }

  @method setPublisher(publisher: PublicKey) {
    this.onlyPublisher();
    this.publisher.getAndRequireEquals();
    this.publisher.set(publisher);
  }

  /**
   *  Prevents non-publisher from calling the method.
   */
  onlyPublisher() {
    const publisher = this.publisher.getAndRequireEquals();
    AccountUpdate.create(publisher).requireSignature();
  }
  @method async approveBase(forest: AccountUpdateForest) {
    this.checkZeroBalanceChange(forest);
  }
}

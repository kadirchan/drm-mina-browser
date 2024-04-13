import {
  Account,
  AccountUpdate,
  AccountUpdateForest,
  DeployArgs,
  Permissions,
  PublicKey,
  State,
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

  /**
   * Maximum height of the device Merkle tree.
   * This is used to restrict the number of devices that can be added to the tree.
   * Number of devices = 2^(maxTreeHeight - 1)
   */
  @state(UInt64) maxTreeHeight = State<UInt64>();

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

  init() {
    this.account.provedState.getAndRequireEquals().assertFalse();

    super.init();

    this.gamePrice.set(UInt64.zero);
    this.discount.set(UInt64.zero);
    this.timeoutInterval.set(UInt64.zero);
    this.maxTreeHeight.set(UInt64.zero);
  }

  @method mintGameToken(to: PublicKey) {
    const price = this.gamePrice.getAndRequireEquals();
    const discount = this.discount.getAndRequireEquals();
    const publisherAddress = this.publisher.getAndRequireEquals();
    const totalPrice = price.sub(discount);

    this.account.balance.requireBetween(UInt64.zero, UInt64.MAXINT());

    const userAccount = Account(to, this.deriveTokenId());
    userAccount.balance.requireEquals(UInt64.zero);

    const accountUpdate = AccountUpdate.createSigned(to);
    accountUpdate.send({ to: publisherAddress, amount: totalPrice });

    this.internal.mint({
      address: to,
      amount: 1n,
    });
  }

  // @method getBalance(address: PublicKey): UInt64 {
  //   const account = Account(address, this.deriveTokenId());
  //   return account.balance.getAndRequireEquals();
  // }

  /**
   * Set the price of the game.
   * Only the publisher can call this method.
   * @param price Price of the game in nanoMina.
   */
  @method setGamePrice(price: UInt64) {
    this.onlyPublisher();
    this.gamePrice.getAndRequireEquals();
    this.gamePrice.set(price);
  }

  /**
   * Set the discount amount for the game.
   * Only the publisher can call this method.
   * @param discount Discount amount for the game in nanoMina.
   */
  @method setDiscount(discount: UInt64) {
    this.onlyPublisher();
    this.discount.getAndRequireEquals();
    this.discount.set(discount);
  }

  /**
   * Set the timeout interval for the proof to be valid.
   * Only the publisher can call this method.
   * @param interval Timeout interval for the proof to be valid.
   */
  @method setTimeoutInterval(interval: UInt64) {
    this.onlyPublisher();
    this.timeoutInterval.getAndRequireEquals();
    this.timeoutInterval.set(interval);
  }

  /**
   * Set the maximum height of the device Merkle tree.
   * Only the publisher can call this method.
   * @param height Maximum height of the device Merkle tree.
   */
  @method setMaxTreeHeight(height: UInt64) {
    this.onlyPublisher();
    this.maxTreeHeight.getAndRequireEquals();
    this.maxTreeHeight.set(height);
  }

  /**
   * Set the public key of the publisher of the game.
   * Only the publisher can call this method.
   * @param publisher Public key of the publisher of the game.
   */
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
  @method approveBase(forest: AccountUpdateForest) {
    this.checkZeroBalanceChange(forest);
  }
}

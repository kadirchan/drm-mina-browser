import {
  Account,
  AccountUpdate,
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
  UInt64,
  method,
  state,
} from 'o1js';

export class Identifiers extends Struct({
  cpuId: Field,
  systemSerial: Field,
  systemUUID: Field,
  baseboardSerial: Field,
  macAddress: Field,
  diskSerial: Field,
}) {
  constructor(
    cpuId: Field,
    systemSerial: Field,
    systemUUID: Field,
    baseboardSerial: Field,
    macAddress: Field,
    diskSerial: Field
  ) {
    super({
      cpuId,
      systemSerial,
      systemUUID,
      baseboardSerial,
      macAddress,
      diskSerial,
    });
    this.cpuId = cpuId;
    this.systemSerial = systemSerial;
    this.systemUUID = systemUUID;
    this.baseboardSerial = baseboardSerial;
    this.macAddress = macAddress;
    this.diskSerial = diskSerial;
  }
  toFields() {
    return [
      this.cpuId,
      this.systemSerial,
      this.systemUUID,
      this.baseboardSerial,
      this.macAddress,
      this.diskSerial,
    ];
  }
}

export class GameToken extends SmartContract {
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

  // /**
  //  * Timestamp of the proof.
  //  */
  // @state(UInt64) proofTimestamp = State<UInt64>();

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
      send: Permissions.proof(),
      setTokenSymbol: Permissions.proof(),
      setZkappUri: Permissions.proof(),
    });
  }

  init() {
    this.account.provedState.getAndRequireEquals().assertFalse();

    super.init();

    this.gamePrice.set(UInt64.from(100));
    this.discount.set(UInt64.from(0));
    this.network.timestamp.requireEquals(this.network.timestamp.get());
  }

  @method mintGameToken() {
    this.onlyPublisher();
    this.token.mint({
      address: this.address,
      amount: 1_000_000_000_000n,
    });
  }

  @method buyGameToken() {
    const price = this.gamePrice.getAndRequireEquals();
    const discount = this.discount.getAndRequireEquals();
    const publisherAddress = this.publisher.getAndRequireEquals();
    const totalPrice = price.sub(discount);

    // Provable.log(this.sender.toFields());
    const accountUpdate = AccountUpdate.createSigned(this.sender);
    const accountTokenUpdate = AccountUpdate.createSigned(
      this.sender,
      this.token.id
    );
    accountTokenUpdate.account.balance
      .getAndRequireEquals()
      .assertEquals(UInt64.zero);
    accountUpdate.send({ to: publisherAddress, amount: totalPrice });

    this.token.send({ from: this.address, to: this.sender, amount: 1 });
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

  /**
   *  Prevents non-publisher from calling the method.
   */
  onlyPublisher() {
    const publisher = this.publisher.getAndRequireEquals();
    AccountUpdate.create(publisher).requireSignature();
  }
}

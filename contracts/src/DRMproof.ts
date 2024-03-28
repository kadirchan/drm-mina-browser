import {
  Account,
  CircuitString,
  Field,
  MerkleMapWitness,
  Poseidon,
  PrivateKey,
  PublicKey,
  SelfProof,
  Signature,
  SmartContract,
  State,
  Struct,
  UInt64,
  ZkProgram,
  method,
  state,
} from 'o1js';
import { GameToken } from './GameTokenContract.js';
import { Identifiers } from './Identifiers.js';

const gameTokenAddress = PrivateKey.random().toPublicKey();

export class DRM extends SmartContract {
  @state(Field) deviceRoot = State<Field>();
  @state(PublicKey) gameTokenAddress = State<PublicKey>;

  @method addDevice(
    userAddress: PublicKey,
    identifiers: Identifiers,
    witness: MerkleMapWitness,
    signature: Signature
  ) {
    const gameTokenId = new GameToken(gameTokenAddress).deriveTokenId();
    const account = Account(userAddress, gameTokenId);
    const tokenBalance = account.balance.getAndRequireEquals();
    tokenBalance.assertGreaterThan(UInt64.zero);

    // Todo add more checks for identifiers

    const currentRoot = this.deviceRoot.getAndRequireEquals();
    const [newRoot, key] = witness.computeRootAndKey(
      Poseidon.hash(userAddress.toFields())
    );

    const identifiersHash = identifiers.hash();
    key.assertEquals(identifiersHash);

    signature.verify(userAddress, [identifiersHash]).assertTrue();
  }
}

export class MapUpdate extends Struct({
  oldRoot: Field,
  newRoot: Field,
  key: Field,
  oldValue: Field,
  newValue: Field,
  witness: MerkleMapWitness,
}) {
  static fromFields(fields: Field[]): MapUpdate {
    return new MapUpdate({
      oldRoot: fields[0],
      newRoot: fields[1],
      key: fields[2],
      oldValue: fields[3],
      newValue: fields[4],
      witness: MerkleMapWitness.fromFields(fields.slice(5)),
    });
  }
  toFields() {
    return [
      this.oldRoot,
      this.newRoot,
      this.key,
      this.oldValue,
      this.newValue,
      ...this.witness.toFields(),
    ];
  }
}

export class DeviceMapTransition extends Struct({
  oldRoot: Field,
  newRoot: Field,
  userAddress: PublicKey,
}) {
  static create(userAddress: PublicKey, update: MapUpdate) {
    const addressHash = Poseidon.hash(userAddress.toFields());
    const [witnessOldRoot, witnessOldKey] = update.witness.computeRootAndKey(
      update.oldValue
    );
    witnessOldKey.assertEquals(addressHash);
    witnessOldKey.assertEquals(update.key);
    witnessOldRoot.assertEquals(update.oldRoot);

    const [witnessNewRoot, witnessNewKey] = update.witness.computeRootAndKey(
      update.newValue
    );

    witnessNewKey.assertEquals(addressHash);
    witnessNewKey.assertEquals(update.key);
    witnessNewRoot.assertEquals(update.newRoot);

    return new DeviceMapTransition({
      oldRoot: update.oldRoot,
      newRoot: update.newRoot,
      userAddress,
    });
  }
  static assertEquals(a: DeviceMapTransition, b: DeviceMapTransition) {
    a.oldRoot.assertEquals(b.oldRoot);
    a.newRoot.assertEquals(b.newRoot);
    a.userAddress.assertEquals(b.userAddress);
  }
}

const DeviceUpdate = ZkProgram({
  name: 'DeviceUpdate',
  publicInput: Field,
  publicOutputs: Field,
  methods: {
    validateDevice: {
      privateInputs: [Identifiers],
      method(commitment: Field, identifiers: Identifiers) {
        commitment.assertEquals(Poseidon.hash(identifiers.toFields()));

        // TODO add more checks

        return commitment;
      },
    },
  },
});

export class DRMUpdateProof extends ZkProgram.Proof(DeviceUpdate) {}

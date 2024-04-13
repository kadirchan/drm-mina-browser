import {
  Field,
  MerkleMapWitness,
  Poseidon,
  PublicKey,
  Struct,
  ZkProgram,
} from 'o1js';
import { Identifiers } from './Identifiers.js';

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

export class SessionOutput extends Struct({
  hash: Field,
  timeStamp: Field,
}) {}

const CreateSessionProof = ZkProgram({
  name: 'CreateSessionProof',
  publicInput: Field,
  publicOutputs: Field,
  methods: {
    validateDevice: {
      privateInputs: [Identifiers],
      method(commitment: Field, identifiers: Identifiers) {
        commitment.assertEquals(Poseidon.hash(identifiers.toFields()));

        return commitment;
      },
    },
  },
});

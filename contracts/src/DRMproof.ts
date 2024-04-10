import {
  Account,
  AccountUpdate,
  Field,
  MerkleMapWitness,
  Poseidon,
  PrivateKey,
  Proof,
  Provable,
  PublicKey,
  Signature,
  SmartContract,
  State,
  Struct,
  TokenId,
  UInt64,
  ZkProgram,
  method,
  state,
} from 'o1js';
import { GameToken } from './GameTokenContract.js';
import { Identifiers } from './Identifiers.js';

export class DRM extends SmartContract {
  @state(Field) deviceRoot = State<Field>();
  @state(Field) sessionRoot = State<Field>();
  @state(PublicKey) gameTokenAddress = State<PublicKey>();

  @method addDevice(
    userAddress: PublicKey,
    previousValue: Field,
    identifiers: Identifiers,
    witness: MerkleMapWitness,
    signature: Signature
  ) {
    const gameTokenId = TokenId.derive(
      this.gameTokenAddress.getAndRequireEquals()
    );

    const accountUpdate = AccountUpdate.create(userAddress, gameTokenId);
    const tokenContract = new GameToken(
      this.gameTokenAddress.getAndRequireEquals()
    );
    const tokenBalance = accountUpdate.account.balance.getAndRequireEquals();
    tokenContract.approveAccountUpdate(accountUpdate);

    tokenBalance.assertGreaterThan(UInt64.zero);

    // Todo add more checks for identifiers

    const [previousRoot, previousKey] =
      witness.computeRootAndKey(previousValue);

    this.deviceRoot.getAndRequireEquals().assertEquals(previousRoot);
    previousKey.assertEquals(Poseidon.hash(userAddress.toFields()));

    const identifiersHash = identifiers.hash();
    const [newRoot, newKey] = witness.computeRootAndKey(identifiersHash);
    newKey.assertEquals(previousKey);

    signature.verify(userAddress, [identifiersHash]).assertTrue();

    this.deviceRoot.set(newRoot);
  }

  @method createSession(
    witness: MerkleMapWitness,
    oldSessionValue: Field,
    newSessionValue: Field,
    proof: DeviceSessionProof
  ) {
    proof.verify();
    this.sessionRoot
      .getAndRequireEquals()
      .assertEquals(proof.publicInput.sessionMerkleRoot);

    this.deviceRoot
      .getAndRequireEquals()
      .assertEquals(proof.publicInput.deviceMerkleRoot);

    oldSessionValue.assertNotEquals(newSessionValue);

    const [oldRoot, oldKey] = witness.computeRootAndKey(oldSessionValue);

    oldKey.assertEquals(proof.publicOutput);

    this.sessionRoot.getAndRequireEquals().assertEquals(oldRoot);

    const [newRoot, newKey] = witness.computeRootAndKey(newSessionValue);

    newKey.assertEquals(proof.publicOutput);

    this.sessionRoot.set(newRoot);
  }

  @method setGameTokenAddress(address: PublicKey) {
    this.gameTokenAddress.getAndRequireEquals();
    this.gameTokenAddress.set(address);
  }

  @method getRoot() {
    return this.deviceRoot.getAndRequireEquals();
  }

  // TODO: Remove after testing
  @method setDeviceRoot(root: Field) {
    this.deviceRoot.getAndRequireEquals();
    this.deviceRoot.set(root);
  }
}

export class SessionPublicInput extends Struct({
  deviceMerkleRoot: Field,
  deviceMerkleWitness: MerkleMapWitness,
  sessionMerkleRoot: Field,
}) {}

const ValidateDevice = ZkProgram({
  name: 'ValidateDevice',
  publicInput: SessionPublicInput,
  publicOutput: Field,
  methods: {
    validateDevice: {
      privateInputs: [Identifiers],
      method(publicInput: SessionPublicInput, identifiers: Identifiers): Field {
        const deviceRoot = publicInput.deviceMerkleRoot;
        const deviceWitness = publicInput.deviceMerkleWitness;

        const identifiersHash = identifiers.hash();
        const [computedRoot, computedKey] =
          deviceWitness.computeRootAndKey(identifiersHash);

        deviceRoot.assertEquals(computedRoot);

        return identifiersHash;
      },
    },
  },
});

export class DeviceSessionProof extends ZkProgram.Proof(ValidateDevice) {}

// TODO add session constraints to addDevice method

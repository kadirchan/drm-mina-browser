import {
  AccountUpdate,
  Field,
  MerkleMapWitness,
  Poseidon,
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

export class SessionPublicInput extends Struct({
  deviceMerkleRoot: Field,
  deviceMerkleWitness: MerkleMapWitness,
  sessionMerkleRoot: Field,
}) {}

export const ValidateDevice = ZkProgram({
  name: 'ValidateDevice',
  publicInput: SessionPublicInput,
  publicOutput: Field,
  methods: {
    proofForSession: {
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

export class DRM extends SmartContract {
  @state(Field) deviceRoot = State<Field>();
  @state(Field) sessionRoot = State<Field>();
  @state(PublicKey) gameTokenAddress = State<PublicKey>();

  events = {
    'new-session': Field,
  };

  @method addDevice(
    userAddress: PublicKey,
    devicePreviousValue: Field,
    identifiers: Identifiers,
    deviceWitness: MerkleMapWitness,
    signature: Signature,
    sessionWitness: MerkleMapWitness
  ) {
    const gameTokenId = TokenId.derive(
      this.gameTokenAddress.getAndRequireEquals()
    );

    const accountUpdate = AccountUpdate.create(userAddress, gameTokenId);
    const gameTokenContract = new GameToken(
      this.gameTokenAddress.getAndRequireEquals()
    );
    const tokenBalance = accountUpdate.account.balance.getAndRequireEquals();
    gameTokenContract.approveAccountUpdate(accountUpdate);

    tokenBalance.assertGreaterThan(UInt64.zero);

    // Todo add more checks for identifiers

    const [previousDeviceRoot, previousDeviceKey] =
      deviceWitness.computeRootAndKey(devicePreviousValue);

    this.deviceRoot.getAndRequireEquals().assertEquals(previousDeviceRoot);
    previousDeviceKey.assertEquals(Poseidon.hash(userAddress.toFields()));

    const identifiersHash = identifiers.hash();
    const [computedRoot, computedKey] =
      deviceWitness.computeRootAndKey(identifiersHash);
    computedKey.assertEquals(previousDeviceKey);

    signature.verify(userAddress, [identifiersHash]).assertTrue();

    this.deviceRoot.set(computedRoot);

    /**
     * Enable session leaf for the device
     * if leaf = 0 device is not enabled
     * otherwise device is enabled
     */

    const [computedSessionRoot, computedSessionKey] =
      sessionWitness.computeRootAndKey(Field.from(0));
    computedSessionKey.assertEquals(identifiersHash);
    computedSessionRoot.assertEquals(this.sessionRoot.getAndRequireEquals());

    const [newSessionRoot, newSessionKey] = sessionWitness.computeRootAndKey(
      Field.from(1)
    );
    this.sessionRoot.set(newSessionRoot);
  }

  @method createSession(
    witness: MerkleMapWitness,
    previousSessionValue: Field,
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

    previousSessionValue.assertNotEquals(Field.from(0));
    previousSessionValue.assertNotEquals(newSessionValue);

    const [previousRoot, previousKey] =
      witness.computeRootAndKey(previousSessionValue);

    previousKey.assertEquals(proof.publicOutput);

    this.sessionRoot.getAndRequireEquals().assertEquals(previousRoot);

    const [newRoot, newKey] = witness.computeRootAndKey(newSessionValue);

    newKey.assertEquals(proof.publicOutput);

    this.sessionRoot.set(newRoot);

    this.emitEvent(
      'new-session',
      Poseidon.hash([proof.publicOutput, newSessionValue])
    );
  }

  @method setGameTokenAddress(address: PublicKey) {
    this.gameTokenAddress.getAndRequireEquals();
    this.gameTokenAddress.set(address);
  }

  // TODO: Remove after testing
  @method getDeviceRoot() {
    return this.deviceRoot.getAndRequireEquals();
  }

  // TODO: Remove after testing
  @method getSessionRoot() {
    return this.sessionRoot.getAndRequireEquals();
  }

  // TODO: Remove after testing
  @method setDeviceRoot(root: Field) {
    this.deviceRoot.getAndRequireEquals();
    this.deviceRoot.set(root);
  }
  // TODO: Remove after testing
  @method setSessionRoot(root: Field) {
    this.sessionRoot.getAndRequireEquals();
    this.sessionRoot.set(root);
  }
}

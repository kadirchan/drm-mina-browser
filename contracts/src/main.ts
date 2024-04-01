import {
  AccountUpdate,
  MerkleMap,
  Mina,
  Poseidon,
  PrivateKey,
  PublicKey,
  Signature,
  TokenId,
  UInt64,
} from 'o1js';

const proofsEnabled = false;
(async () => {
  const Local = Mina.LocalBlockchain({ proofsEnabled });
  Mina.setActiveInstance(Local);

  const deployer = Local.testAccounts[0];
  const alice = Local.testAccounts[1];
  const bob = Local.testAccounts[2];
})();

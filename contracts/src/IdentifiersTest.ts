import { Identifiers } from './Identifiers.js';
import { mockIdentifiers } from './mock.js';

const RawIdentifiers = mockIdentifiers[0];

const identifiers = Identifiers.fromRaw(RawIdentifiers);

console.log(identifiers.cpuId);

console.log(identifiers.cpuId.toString());

console.log(identifiers.systemSerial);

console.log(identifiers.systemSerial.toString());

console.log(identifiers.systemUUID);

console.log(identifiers.systemUUID.toString());

console.log(identifiers.baseboardSerial);

console.log(identifiers.baseboardSerial.toString());

console.log(identifiers.macAddress);

console.log(identifiers.macAddress.ethernet);

console.log(identifiers.macAddress.ethernet.toString());

console.log(identifiers.macAddress.wifi);

console.log(identifiers.macAddress.wifi.toString());

console.log(identifiers.diskSerial);

console.log(identifiers.diskSerial.toString());

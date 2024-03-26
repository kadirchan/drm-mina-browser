import { Field, Struct } from 'o1js';

/*
  cpu_id: '52060A00FFFBEBBF',
  system_serial: '5CD0273QXP',
  system_uuid: '30444335-3732-5133-5850-bce92f8b2e35',
  baseboard_serial: 'PKEAE028JDW0D7',
  mac_addresses: [ 'bc:e9:2f:8b:2e:35', 'cc:d9:ac:b6:28:0d' ]
 */

export type IdentifierType =
  | 'cpuId'
  | 'systemSerial'
  | 'systemUUID'
  | 'baseboardSerial'
  | 'macAddress'
  | 'diskSerial';

export interface RawIdentifiers {
  cpuId: string;
  systemSerial: string;
  systemUUID: string;
  baseboardSerial: string;
  macAddress: string;
  diskSerial: string;
}

export interface CleanIdentifiers {
  cpuId: number;
  systemSerial: number;
  systemUUID: number;
  baseboardSerial: number;
  macAddress: number;
  diskSerial: number;
}

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
  fromCleanIdentifiers(cleanIdentifiers: CleanIdentifiers) {
    return new Identifiers(
      Field(cleanIdentifiers.cpuId),
      Field(cleanIdentifiers.systemSerial),
      Field(cleanIdentifiers.systemUUID),
      Field(cleanIdentifiers.baseboardSerial),
      Field(cleanIdentifiers.macAddress),
      Field(cleanIdentifiers.diskSerial)
    );
  }
}

export function cleanUpRawIdentifiers(
  rawIdentifiers: RawIdentifiers
): CleanIdentifiers {
  //TODO: Implement this function
  return {
    cpuId: 101010,
    systemSerial: 101010,
    systemUUID: 101010,
    baseboardSerial: 101010,
    macAddress: 101010,
    diskSerial: 101010,
  };
}

export function validateRawIdentifiers(
  rawIdentifiers: RawIdentifiers
): boolean {
  // TODO: Implement this function
  return true;
}

import { Field } from 'o1js';

export class UUID {
  constructor(public uuid: string) {
    if (!this.isValid()) {
      throw new Error('Invalid UUID');
    }
    this.uuid = uuid.replace(/-/g, '').toUpperCase();
  }

  isValid(): boolean {
    const uuidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return uuidRegex.test(this.uuid);
  }

  toBigNumber(): string {
    return BigInt('0x' + this.uuid).toString(10);
  }

  public toField(): Field {
    const bigint = this.toBigNumber();
    return Field(bigint);
  }
}

export class CPUID {
  constructor(public cpuid: string) {
    if (!this.isValid()) {
      throw new Error('Invalid CPUID');
    }
    this.cpuid = cpuid.toUpperCase();
  }

  isValid(): boolean {
    const cpuidRegex = /^[0-9A-F]{16}$/;
    return cpuidRegex.test(this.cpuid);
  }

  toBigNumber(): string {
    return BigInt('0x' + this.cpuid).toString(10);
  }

  public toField(): Field {
    const bigint = this.toBigNumber();
    return Field(bigint);
  }
}

export class Serial {
  constructor(public serial: string) {
    this.serial = serial.slice(0, 31).toUpperCase();
  }
}

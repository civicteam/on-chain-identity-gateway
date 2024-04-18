import {Schema, serialize, deserializeUnchecked} from "borsh";

export const SCHEMA: Schema = new Map();

// Class wrapping a plain object
export abstract class Assignable {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(properties: { [key: string]: any }) {
    Object.keys(properties).forEach((key: string) => {
      // this is probably possible in Typescript,
      // but requires (keyof this) which is not possible in the constructor
      // WARNING: This functionality actually changes depending on which ts compiler you use
      // it works with tsc, not with bun. To be safe we should change it.
      // @ts-expect-error - therefore we need to disable this error.
      this[key] = properties[key];
    });
  }

  encode(): Buffer {
    return Buffer.from(serialize(SCHEMA, this));
  }

  static decode<T extends Assignable>(data: Buffer): T {
    // use deserializeUnchecked here as opposed to deserialize,
    // as the latter throws an error if the data has trailing bytes.
    return deserializeUnchecked(SCHEMA, this, data);
  }
}

// Class representing a Rust-compatible enum, since enums are only strings or
// numbers in pure JS
export abstract class Enum extends Assignable {
  enum: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(properties: any) {
    super(properties);
    if (Object.keys(properties).length !== 1) {
      throw new Error("Enum can only take single value");
    }
    this.enum = "";
    Object.keys(properties).forEach((key) => {
      this.enum = key;
    });
  }
}

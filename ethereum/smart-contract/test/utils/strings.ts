import { decodeBytes32String, encodeBytes32String } from 'ethers';
/**
 * Converts a string into a hex representation of bytes32
 */
export const toBytes32 = (text: string) => encodeBytes32String(text);

/**
 * Converts a bytes32 hex string into a utf-8 string
 */
export const fromBytes32 = (bytes32String: string) => decodeBytes32String(bytes32String);

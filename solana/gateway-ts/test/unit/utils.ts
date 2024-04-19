import sinon from "sinon";
import {AccountInfo, PublicKey} from "@solana/web3.js";

import { GatewayTokenData, GatewayTokenState, PROGRAM_ID } from "../../src";
import { AssignablePublicKey } from "../../src";

export const getAccountWithState = (
  state: GatewayTokenState,
  pubkey: PublicKey,
  ownerKey: PublicKey,
  gatekeeperNetworkKey: PublicKey,
  gatekeeperKey: PublicKey,
  expiry?: number
): {
  account: AccountInfo<Buffer>;
  /** the account Pubkey as base-58 encoded string */
  pubkey: PublicKey;
} => {
  const gtData = new GatewayTokenData({
    state,
    owner: AssignablePublicKey.fromPublicKey(ownerKey),
    issuingGatekeeper: AssignablePublicKey.fromPublicKey(gatekeeperKey),
    gatekeeperNetwork: AssignablePublicKey.fromPublicKey(gatekeeperNetworkKey),
    version: [0],
    parentGatewayToken: undefined,
    ownerIdentity: undefined,
    expiry,
  });
  return {
    pubkey,
    account: {
      executable: false,
      owner: PROGRAM_ID,
      lamports: 1649520, // This value does not matter but is taken from an example on-chain
      data: gtData.encode(),
    },
  };
};

export const matchesPubkeyArray = (pubkeys: PublicKey[]) =>
  sinon.match((toMatch) => {
    if (!Array.isArray(toMatch)) return false;
    if (toMatch.length !== pubkeys.length) return false;
    return toMatch.every((pubkey, i) => pubkey.equals(pubkeys[i]));
  });

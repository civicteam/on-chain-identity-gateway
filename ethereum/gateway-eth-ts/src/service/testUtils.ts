import { Wallet, Provider } from "ethers";

export const DEFAULT_MNEMONIC =
  "test test test test test test test test test test test junk";

// During testing, the 0th index is the deployer key, the 2nd index is used as the gatekeeper key
// See hardhat.config.ts
export const deployerWallet = (provider: Provider): Wallet =>
  new Wallet(Wallet.fromPhrase(DEFAULT_MNEMONIC).derivePath("m/44'/60'/0'/0/0").privateKey).connect(provider);
export const gatekeeperWallet = (provider: Provider): Wallet =>
  new Wallet(Wallet.fromPhrase(DEFAULT_MNEMONIC).derivePath("m/44'/60'/0'/0/2").privateKey).connect(provider);

// matches the bootstrapped network in gateway-token
export const gatekeeperNetwork = 1n;

// These addresses are the ones that hardhat deploys to in the local test environment
// Note, they differ from the default create2 addresses used in production
export const TEST_GATEWAY_TOKEN_ADDRESS = {
  gatewayToken: "0x3335EaBdbbCa104e30ff0f6E185cb7754b0260B0",
  forwarder: "0xd7D74d77733E309931E4a368173C0f8b2A5cf4C5",
  flagsStorage: "0xb169cc38847bFc8a3887172c5497975C9b41C5FE",
  chargeHandler: "0x093B855f2fd1f03C0d38DB05dDf5F326B0fd32E6",
};

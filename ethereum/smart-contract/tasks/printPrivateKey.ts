import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { HardhatNetworkHDAccountsConfig } from 'hardhat/src/types/config';
import { Mnemonic } from 'ethers';

export const printPrivateKey = async (args: any, hre: HardhatRuntimeEnvironment) => {
  const { ethers, config } = hre;
  const accounts = config.networks.hardhat.accounts as HardhatNetworkHDAccountsConfig;
  console.log(accounts);

  const index = parseInt(args.index, 10);
  // const account = await ethers.getSigners()[index];

  const wallet1 = ethers.HDNodeWallet.fromMnemonic(Mnemonic.fromPhrase(accounts.mnemonic), accounts.path + index);

  const privateKey1 = wallet1.privateKey;

  console.log(privateKey1);
};

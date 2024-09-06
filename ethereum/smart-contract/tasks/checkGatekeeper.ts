import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { GatewayToken__factory } from '../typechain-types';

export const checkGatekeeper = async (args: any, hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments } = hre;

  const gatekeeper = ethers.getAddress(args.gatekeeper);
  const gatekeeperNetwork = args.gatekeepernetwork;

  const gatewayToken = await deployments.get('GatewayTokenProxy');

  const contract = GatewayToken__factory.connect(gatewayToken.address);

  const alreadyAdded = await contract.isGatekeeper(gatekeeper, gatekeeperNetwork);
  console.log(`gatekeeper ${gatekeeper} already in network ${gatekeeperNetwork}? ${alreadyAdded}`);
};

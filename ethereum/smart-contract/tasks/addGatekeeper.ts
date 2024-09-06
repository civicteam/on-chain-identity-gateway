import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { GatewayToken__factory } from '../typechain-types';

export const addGatekeeper = async (args: any, hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments } = hre;
  const [deployer] = await ethers.getSigners();

  const gatekeeper = ethers.getAddress(args.gatekeeper);
  const gatekeeperNetwork = args.gatekeepernetwork;

  const gatewayToken = await deployments.get('GatewayTokenProxy');

  const contract = GatewayToken__factory.connect(gatewayToken.address, deployer);

  const alreadyAdded = await contract.isGatekeeper(gatekeeper, gatekeeperNetwork);
  console.log(`gatekeeper ${gatekeeper} already added to network ${gatekeeperNetwork}: ${alreadyAdded}`);
  if (alreadyAdded) return;

  const txResponse = await contract.connect(deployer).addGatekeeper(gatekeeper, gatekeeperNetwork);
  const txReceipt = await txResponse.wait();
  console.log(`added new gatekeeper ${gatekeeper} to network ${gatekeeperNetwork} using ${txReceipt?.gasUsed} gas`);
};

import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { GatewayToken__factory } from '../typechain-types';

export const checkGT = async (args: any, hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments } = hre;

  const account = ethers.getAddress(args.address);

  const gatewayToken = await deployments.get('GatewayToken');
  const contract = GatewayToken__factory.connect(gatewayToken.address);

  const result = await contract['verifyToken(address,uint256)'](account, args.gatekeepernetwork);

  const result2 = await contract['getTokenIdsByOwnerAndNetwork(address,uint256)'](account, args.gatekeepernetwork);

  console.log({ result, result2 });
};

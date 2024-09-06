import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { GatewayToken__factory } from '../typechain-types';

export const addForwarder = async (args: any, hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments } = hre;

  const [deployer] = await ethers.getSigners();

  const gatewayToken = await deployments.get('GatewayToken');

  const contract = GatewayToken__factory.connect(gatewayToken.address, deployer);
  const txResponse = await contract.connect(deployer).addForwarder(args.forwarder);
  const txReceipt = await txResponse.wait();

  console.log(
    'added new forwarder with ' +
      args.forwarder +
      ' address into Gateway Token at ' +
      gatewayToken.address +
      ' using ' +
      txReceipt?.gasUsed +
      ' gas',
  );
};

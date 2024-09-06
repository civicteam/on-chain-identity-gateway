import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { ethers } from 'hardhat';

const func = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, upgrades } = hre;
  const gatewayTokenFactoryV0 = await ethers.getContractFactory('GatewayTokenV0');
  const gatewayTokenFactory = await ethers.getContractFactory('GatewayToken');
  const deployedGatewayToken = await deployments.get('GatewayTokenProxy');
  await upgrades.forceImport(deployedGatewayToken.address, gatewayTokenFactoryV0);
  await upgrades.upgradeProxy(deployedGatewayToken.address, gatewayTokenFactory);

  console.log('upgraded GatewayToken at ' + deployedGatewayToken.address);
};

export default func;
func.id = 'upgrade_v1';
func.tags = ['UpgradeV1'];
func.dependencies = [];

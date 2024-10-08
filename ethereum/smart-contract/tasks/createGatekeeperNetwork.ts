import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { GatewayToken__factory } from '../typechain-types';

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

export const createGatekeeperNetwork = async (args: any, hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments } = hre;
  const [deployer] = await ethers.getSigners();

  const gatekeeper = ethers.getAddress(args.gatekeeper);
  const gatekeeperNetwork = args.gatekeepernetwork;

  const gatewayToken = await deployments.get('GatewayTokenProxy');

  const contract = GatewayToken__factory.connect(gatewayToken.address, deployer);

  const alreadyExists = await contract.getNetwork(gatekeeperNetwork);
  console.log(`Does network ${gatekeeperNetwork} exist?`, !!alreadyExists);

  if (alreadyExists) {
    console.log('network ' + gatekeeperNetwork + ' already exists with name ' + alreadyExists);
    return;
  }

  const createTxReceipt = await contract.createNetwork(gatekeeperNetwork, args.name, false, NULL_ADDRESS);
  const createTx = await createTxReceipt.wait();

  console.log(
    `created network ${gatekeeperNetwork} on Gateway Token at ${
      gatewayToken.address
    } using ${createTx?.gasUsed.toString()} gas`,
  );

  // wait 20 seconds for network to be created
  await new Promise((resolve) => setTimeout(resolve, 20000));

  const addGkTxReceipt = await contract.addGatekeeper(gatekeeper, gatekeeperNetwork); //{ gasPrice: 1000000, gasLimit: 1000000 });
  const addGkTx = await addGkTxReceipt.wait();
  console.log(
    `added new gatekeeper ${gatekeeper} to network ${gatekeeperNetwork} using ${addGkTx?.gasUsed.toString()} gas`,
  );
};

import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { getAccounts } from '../scripts/util';
import { GatewayToken__factory } from '../typechain-types';

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
const gatekeeperNetwork = 1;
// open to all - private key is known
const testGatekeeper = '0x34bb5808d46a21AaeBf7C1300Ef17213Fe215B91';
const civicDevGatekeeper = '0x3Afb27942b60d9D4319557A0f3363DC3dA0645B6';
const civicProdGatekeeper = '0x964617b2d933c6e5c6c1B30681DCAee23Baa9836';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers } = hre;

  // WARNING! If any of the below keys are the same as each other
  // hardhat does not resolve them properly. Check by deploying to localhost that they are correct first
  // yarn local --no-deploy &
  // yarn deploy localhost
  let { deployer, gatekeeper } = await getAccounts(hre);

  const deployerSigner = await ethers.getSigner(deployer);

  const gatewayToken = await deployments.get('GatewayTokenProxy');

  const token = GatewayToken__factory.connect(gatewayToken.address, deployerSigner);

  // check if superadmin
  const isSuperAdmin = await token.isSuperAdmin(deployer);
  console.log('deployer ', deployer, 'isSuperAdmin', isSuperAdmin);

  if (await token.getNetwork(gatekeeperNetwork)) {
    console.log('network ' + gatekeeperNetwork + ' already exists');
  } else {
    const createNetworkTx = await (
      await token.createNetwork(gatekeeperNetwork, 'tgnuXXNMDLK8dy7Xm1TdeGyc95MDym4bvAQCwcW21Bf', false, NULL_ADDRESS, {
        from: deployer,
      })
    ).wait();
    console.log(
      'created network ' +
        gatekeeperNetwork +
        ' on Gateway Token at ' +
        gatewayToken.address +
        ' using ' +
        createNetworkTx?.gasUsed.toString() +
        ' gas',
    );
  }

  if (!(await token.isGatekeeper(gatekeeper, gatekeeperNetwork))) {
    const addGatekeeperTx = await (await token.addGatekeeper(gatekeeper, gatekeeperNetwork)).wait();
    console.log(
      'added new gatekeeper with ' +
        gatekeeper +
        ' address into Gateway Token at ' +
        gatewayToken.address +
        ' using ' +
        addGatekeeperTx?.gasUsed.toString() +
        ' gas',
    );
  } else console.log(`gatekeeper ${gatekeeper} already in network ${gatekeeperNetwork}`);

  if (!(await token.isGatekeeper(testGatekeeper, gatekeeperNetwork))) {
    const addTestGatekeeperTx = await (await token.addGatekeeper(testGatekeeper, gatekeeperNetwork)).wait();
    console.log(
      'added test gatekeeper with ' +
        testGatekeeper +
        ' address into Gateway Token at ' +
        gatewayToken.address +
        ' using ' +
        addTestGatekeeperTx?.gasUsed.toString() +
        ' gas',
    );
  } else console.log(`gatekeeper ${testGatekeeper} already in network ${gatekeeperNetwork}`);

  if (!(await token.isGatekeeper(civicDevGatekeeper, gatekeeperNetwork))) {
    const addCivicDevGatekeeperTx = await (await token.addGatekeeper(civicDevGatekeeper, gatekeeperNetwork)).wait();
    console.log(
      'added civic dev gatekeeper with ' +
        civicDevGatekeeper +
        ' address into Gateway Token at ' +
        gatewayToken.address +
        ' using ' +
        addCivicDevGatekeeperTx?.gasUsed.toString() +
        ' gas',
    );
  } else console.log(`gatekeeper ${civicDevGatekeeper} already in network ${gatekeeperNetwork}`);

  if (!(await token.isGatekeeper(civicProdGatekeeper, gatekeeperNetwork))) {
    const addCivicProdGatekeeperTx = await (await token.addGatekeeper(civicProdGatekeeper, gatekeeperNetwork)).wait();
    console.log(
      'added civic prod gatekeeper with ' +
        civicProdGatekeeper +
        ' address into Gateway Token at ' +
        gatewayToken.address +
        ' using ' +
        addCivicProdGatekeeperTx?.gasUsed.toString() +
        ' gas',
    );
  } else console.log(`gatekeeper ${civicProdGatekeeper} already in network ${gatekeeperNetwork}`);
};

export default func;
func.id = 'create_test_gatekeeper_network';
func.tags = ['TestGatekeeperNetwork'];
func.dependencies = !!process.env.IGNORE_DEPS ? [] : ['GatewayToken', 'Forwarder'];

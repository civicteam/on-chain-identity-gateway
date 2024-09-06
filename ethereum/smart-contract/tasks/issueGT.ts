import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Wallet } from 'ethers';
import { NULL_CHARGE } from '../test/utils/eth';
import { GatewayToken__factory } from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

export const issueGT = async (args: any, hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments } = hre;

  const [owner] = await ethers.getSigners();
  const gatekeeper: Wallet | SignerWithAddress = process.env.PRIVATE_KEY
    ? new ethers.Wallet(process.env.PRIVATE_KEY, owner.provider)
    : owner;
  const gatekeeperNetwork = BigInt(args.gatekeepernetwork);

  const account = ethers.getAddress(args.address);

  const gatewayToken = await deployments.get('GatewayTokenProxy');

  const contract = GatewayToken__factory.connect(gatewayToken.address, gatekeeper);

  const hasToken = await contract['verifyToken(address,uint256)'](account, args.gatekeepernetwork);
  console.log({ hasToken });

  const mintTx = await contract.mint.populateTransaction(account, gatekeeperNetwork, 0, 0, NULL_CHARGE);

  if (!mintTx.data) throw new Error('No data output from the transaction creation step');

  let transactionReceipt;

  // if (!args.forwarded) {
  transactionReceipt = await gatekeeper.sendTransaction(mintTx);
  // Requires ../gateway-eth so this is commented out to ensure building works without it
  // } else {
  //   const forwarder = FlexibleNonceForwarder__factory.connect(DEFAULT_FORWARDER_ADDRESS, owner);
  //
  //   const { request, signature } = await signMetaTxRequest(gatekeeper, forwarder as IForwarder, {
  //     from: gatekeeper.address,
  //     to: DEFAULT_GATEWAY_TOKEN_ADDRESS,
  //     data: mintTx.data,
  //     gas: 1_000_000,
  //   });
  //
  //   const unsignedTx = await forwarder.execute.populateTransaction(request, signature);
  //
  //   transactionReceipt = await owner.sendTransaction(unsignedTx);
  // }
  console.log(transactionReceipt);

  await transactionReceipt.wait();
};

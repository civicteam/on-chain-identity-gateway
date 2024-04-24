/**
 * Listen to the gateway token on a given network for a wallet
 *
 * ## Usage
 * ```
 * yarn ts-node scripts/onGatewayToken.ts <gatekeeperNetwork> [walletAddress]
 * ```
 *
 * Use a custom RPC endpoint by setting the CLUSTER_ENDPOINT environment variable.
 */
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import {
  getGatewayToken,
  getGatewayTokenAddressForOwnerAndGatekeeperNetwork,
  onGatewayToken,
} from "../src";

const [gatekeeperNetworkString, walletAddressString] = process.argv.slice(2);

if (!gatekeeperNetworkString) throw new Error("Missing gatekeeper network");

const endpoint = process.env.CLUSTER_ENDPOINT || clusterApiUrl("devnet");
const connection = new Connection(endpoint, "processed");

const gatekeeperNetwork = new PublicKey(gatekeeperNetworkString);
const walletAddress = walletAddressString
  ? new PublicKey(walletAddressString)
  : undefined;

(async () => {
  const gatewayTokenAddress =
    getGatewayTokenAddressForOwnerAndGatekeeperNetwork(
      walletAddress!,
      gatekeeperNetwork,
    );
  const initialState = await getGatewayToken(connection, gatewayTokenAddress);
  console.log("Initial state", initialState);

  await onGatewayToken(
    connection,
    walletAddress!,
    gatekeeperNetwork,
    (gatewayToken) => {
      console.log("GT:", gatewayToken);
    },
  );
})().catch((error) => console.error(error));

import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import {expireToken, getGatewayToken, makeTransaction} from "../src";
import * as os from "os";

const gatewayToken = new PublicKey(process.argv[2]);
const keypair = Keypair.fromSecretKey(
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Buffer.from(require(os.homedir() + "/.config/solana/id.json")),
);

(async () => {
  const endpoint = process.env.CLUSTER_ENDPOINT || clusterApiUrl("devnet");
  const connection = new Connection(endpoint, "confirmed");

  const token = await getGatewayToken(connection, gatewayToken);

  console.log(token);

  if (!token) throw new Error("Token not found");

  console.log("gatekeeperNetwork", token.gatekeeperNetwork.toBase58());

  const instruction = expireToken(
    gatewayToken,
    keypair.publicKey,
    token.gatekeeperNetwork,
  );

  const tx = await makeTransaction(connection, [instruction], keypair);
  const txSig = await connection.sendTransaction(tx);

  console.log(txSig);
})().catch(console.error);

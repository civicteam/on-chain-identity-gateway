import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import { SOLANA_COMMITMENT } from "../src/util/constants";
import { airdropTo, GatekeeperService } from "../src";
import { homedir } from "os";
import * as path from "path";

const LAMPORTS_FOR_ISSUANCE = 2_000_000; // The owner needs this much to issue their own token.

// eslint-disable-next-line @typescript-eslint/no-var-requires
const gatekeeperKey = require(
  path.join(
    homedir(),
    ".config",
    "solana",
    "G1y4BUXnbSMsdcXbCTMEdRWW9Th9tU9WfAmgbPDX7rRG.json",
  ),
);
const gatekeeper = Keypair.fromSecretKey(Buffer.from(gatekeeperKey));

const gatekeeperNetworkKey = new PublicKey(
  "tgnuXXNMDLK8dy7Xm1TdeGyc95MDym4bvAQCwcW21Bf",
);

const owner = Keypair.generate();
const endpoint = clusterApiUrl("devnet");
const connection = new Connection(endpoint, SOLANA_COMMITMENT);

const gatekeeperService = new GatekeeperService(
  connection,
  gatekeeperNetworkKey,
  gatekeeper,
  {
    rentPayer: owner.publicKey,
    defaultExpirySeconds: 30,
  },
);

console.log("Refreshing gateway token for " + owner.publicKey);

(async function () {
  await airdropTo(
    connection,
    owner.publicKey,
    clusterApiUrl("devnet"),
    LAMPORTS_FOR_ISSUANCE,
  );
  let { blockhash } = await connection.getLatestBlockhash(SOLANA_COMMITMENT);

  // issue first
  const { transaction: issueTx } = await gatekeeperService.issue(
    owner.publicKey,
    {
      blockhashOrNonce: { recentBlockhash: blockhash },
    },
  );
  issueTx.partialSign(owner);

  const issueTxSig = await connection.sendRawTransaction(issueTx.serialize());
  console.log("issueTxSig", issueTxSig);
  let latestBlockhash = await this.connection.getLatestBlockhash();
  await connection.confirmTransaction({
    signature: issueTxSig,
    ...latestBlockhash,
  });
  console.log("issue confirmed");

  ({ blockhash } = await connection.getLatestBlockhash(SOLANA_COMMITMENT));

  const gt = await gatekeeperService.findGatewayTokenForOwner(owner.publicKey);

  console.log("gateway token", gt!.publicKey.toBase58());

  // now refresh (owner is feepayer)
  const { transaction: refreshTx } = await gatekeeperService.updateExpiry(
    gt!.publicKey,
    Date.now() / 1000,
    {
      blockhashOrNonce: { recentBlockhash: blockhash },
      feePayer: owner.publicKey,
    },
  );

  // simulate serializing and sending to the frontend (do not verify sigs as not all sigs are present yet).
  const serializedTx = refreshTx
    .serialize({ verifySignatures: false })
    .toString("base64");
  console.log("serializedTx", serializedTx);

  // simulate deserializing and signing
  const deserializedTx = Transaction.from(Buffer.from(serializedTx, "base64"));
  deserializedTx.partialSign(owner);

  const signature = await connection.sendRawTransaction(
    deserializedTx.serialize(),
  );
  latestBlockhash = await this.connection.getLatestBlockhash();
  console.log("Tx signature", signature);
  await connection.confirmTransaction({ signature, ...latestBlockhash });
  console.log("confirmed");
})().catch((error) => console.error(error));

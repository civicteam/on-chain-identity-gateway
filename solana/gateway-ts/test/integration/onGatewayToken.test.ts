import chai from "chai";
import chaiSubset from "chai-subset";
import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  addGatekeeper,
  GatewayToken,
  getGatekeeperAccountAddress,
  getGatewayTokenAddressForOwnerAndGatekeeperNetwork,
  issue,
  makeTransaction,
  onGatewayToken,
} from "../../src";
import { VALIDATOR_URL } from "../constants";

chai.use(chaiSubset);

describe("onGatewayToken", function () {
  this.timeout(10_000);
  const connection = new Connection(VALIDATOR_URL, "processed");
  const owner = Keypair.generate().publicKey;
  const gatekeeperAuthority = Keypair.generate();
  const gatekeeperNetwork = Keypair.generate();

  const gatekeeperAccount = getGatekeeperAccountAddress(
    gatekeeperAuthority.publicKey,
    gatekeeperNetwork.publicKey,
  );
  const payer = Keypair.generate();

  before(async () => {
    // airdrop to payer
    await connection.confirmTransaction({
      signature: await connection.requestAirdrop(
        payer.publicKey,
        LAMPORTS_PER_SOL,
      ),
      ...(await connection.getLatestBlockhash()),
    });

    const addGatekeeperTx = await makeTransaction(
      connection,
      [
        addGatekeeper(
          payer.publicKey,
          gatekeeperAccount,
          gatekeeperAuthority.publicKey,
          gatekeeperNetwork.publicKey,
        ),
      ],
      payer,
      [gatekeeperNetwork],
    );
    const signature = await connection.sendTransaction(addGatekeeperTx);

    await connection.confirmTransaction({
      signature,
      ...(await connection.getLatestBlockhash()),
    });
  });

  it("should listen to created tokens", async () => {
    // The promise will resolve when the token is created
    let heardCreationCallback: (token: GatewayToken) => void = () => {};
    const heardCreation = new Promise((resolve) => {
      heardCreationCallback = resolve;
    });

    // register the listener
    const subscriptionId = onGatewayToken(
      connection,
      owner,
      gatekeeperNetwork.publicKey,
      heardCreationCallback,
    );

    // issue the token
    const gtAddress = getGatewayTokenAddressForOwnerAndGatekeeperNetwork(
      owner,
      gatekeeperNetwork.publicKey,
    );

    console.log("issuing token to address", gtAddress.toBase58());

    const issueGTTransaction = await makeTransaction(
      connection,
      [
        issue(
          gtAddress,
          payer.publicKey,
          gatekeeperAccount,
          owner,
          gatekeeperAuthority.publicKey,
          gatekeeperNetwork.publicKey,
        ),
      ],
      payer,
      [gatekeeperAuthority],
    );
    const signature = await connection.sendTransaction(issueGTTransaction);

    await connection.confirmTransaction({
      signature,
      ...(await connection.getLatestBlockhash()),
    });

    // wait for the listener to be triggered
    await heardCreation;

    // drop the subscription
    await connection.removeAccountChangeListener(subscriptionId);
  });
});

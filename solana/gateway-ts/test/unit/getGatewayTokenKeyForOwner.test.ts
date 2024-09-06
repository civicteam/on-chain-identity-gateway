import chai from "chai";
import chaiSubset from "chai-subset";
import {
  Connection,
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  addGatekeeper,
  getGatekeeperAccountAddress,
  getGatewayTokenAddressForOwnerAndGatekeeperNetwork,
  issue,
  makeTransaction,
} from "../../src";
import { VALIDATOR_URL } from "../constants";

chai.use(chaiSubset);
const { expect } = chai;

describe("getGatewayTokenKeyForOwner", function () {
  let connection: Connection;
  let owner: PublicKey;
  let gatekeeperAuthority: Keypair;
  let gatekeeperAccount: PublicKey;
  let gatekeeperNetwork: Keypair;
  let payer: Keypair;

  beforeEach(async () => {
    owner = Keypair.generate().publicKey;
    gatekeeperAuthority = Keypair.generate();
    gatekeeperNetwork = Keypair.generate();
    gatekeeperAccount = getGatekeeperAccountAddress(
      gatekeeperAuthority.publicKey,
      gatekeeperNetwork.publicKey,
    );
  });

  it("get token address with wrong size seed should fail", () => {
    const shouldFail = () =>
      getGatewayTokenAddressForOwnerAndGatekeeperNetwork(
        owner,
        gatekeeperNetwork.publicKey,
        1e50,
      );
    expect(shouldFail).to.throw("index must be < max(8 bytes)");
  });

  // TODO move into a separate suite
  context("integration", () => {
    before(async () => {
      connection = new Connection(VALIDATOR_URL);
      payer = Keypair.generate();
      const signature = await connection.requestAirdrop(
        payer.publicKey,
        LAMPORTS_PER_SOL,
      );
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction(
        { signature, ...latestBlockhash },
        "confirmed",
      );
    });

    it("should add gateway token", async () => {
      const instructions = [
        addGatekeeper(
          payer.publicKey,
          gatekeeperAccount,
          gatekeeperAuthority.publicKey,
          gatekeeperNetwork.publicKey,
        ),
        issue(
          getGatewayTokenAddressForOwnerAndGatekeeperNetwork(
            owner,
            gatekeeperNetwork.publicKey,
          ),
          payer.publicKey,
          gatekeeperAccount,
          owner,
          gatekeeperAuthority.publicKey,
          gatekeeperNetwork.publicKey,
        ),
      ];

      const tx = await makeTransaction(connection, instructions, payer, [
        gatekeeperNetwork,
        gatekeeperAuthority,
      ]);

      const signature = await connection.sendTransaction(tx, {
        preflightCommitment: "confirmed",
      });
      const latestBlockhash = await connection.getLatestBlockhash();
      const confirmResult = await connection.confirmTransaction(
        { signature, ...latestBlockhash },
        "confirmed",
      );

      expect(confirmResult.value.err).to.be.null;
    });
  });
});

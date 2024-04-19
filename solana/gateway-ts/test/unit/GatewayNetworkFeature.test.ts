import chai from "chai";
import chaiSubset from "chai-subset";
import sinon from "sinon";
import { PublicKey } from "@solana/web3.js";
import {
  getFeatureAccountAddress,
  NetworkFeature,
  UserTokenExpiry,
} from "../../src";

chai.use(chaiSubset);
const { expect } = chai;
const sandbox = sinon.createSandbox();

describe("GatewayNetwork", () => {
  afterEach(sandbox.restore);

  context("GatekeeperNetwork Feature", () => {
    it("can correctly derive featureAccount", async () => {
      const expireFeature = new NetworkFeature({
        userTokenExpiry: new UserTokenExpiry({}),
      });

      const featureAddress = await getFeatureAccountAddress(
        expireFeature,
        new PublicKey("tibePmPaoTgrs929rWpu755EXaxC7M3SthVCf6GzjZt")
      );
      expect(featureAddress.toBase58()).to.equal(
        "BNkYz4VZFuNaLey1hF1GCjFfN1p11trYouGPKqwH7ioJ"
      );
    });
  });
});

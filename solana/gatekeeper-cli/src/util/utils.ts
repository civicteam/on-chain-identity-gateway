import {Cluster, clusterApiUrl, Connection, Keypair, PublicKey} from "@solana/web3.js";
import {airdropTo, GatekeeperService, getConnection} from "@civic/solana-gatekeeper-lib";
import { GatewayToken } from "@civic/solana-gateway-ts";

export type ExtendedCluster = Cluster | "localnet" | "civicnet";

export const CIVICNET_URL =
    "http://ec2-44-214-135-83.compute-1.amazonaws.com:8899";

export const getTokenUpdateProperties = async (
  args: { [p: string]: any },
  flags: {
    priorityFeeLamports?: number | undefined;
    gatekeeperNetworkKey: PublicKey | undefined;
    help: void;
    cluster: ExtendedCluster | undefined;
    gatekeeperKey: Keypair | undefined;
    airdrop: boolean;
  }
): Promise<{
  gatewayToken: PublicKey;
  gatekeeper: Keypair;
  service: GatekeeperService;
}> => {
  const gatewayToken: PublicKey = args.gatewayToken as PublicKey;
  const gatekeeper = flags.gatekeeperKey as Keypair;
  const gatekeeperNetwork = flags.gatekeeperNetworkKey as PublicKey;

  const connection = getConnectionFromEnv(flags.cluster);
  if (flags.airdrop) {
    await airdropTo(connection, gatekeeper.publicKey, flags.cluster as string);
  }

  const options = {
    ...(flags.priorityFeeLamports ? {priorityFeeMicroLamports: flags.priorityFeeLamports} : {}),
  };
  const service = new GatekeeperService(
    connection,
    gatekeeperNetwork,
    gatekeeper,
    options,
  );
  return { gatewayToken, gatekeeper, service };
};

export const getClusterUrl = (cluster: ExtendedCluster): string => {
    switch (cluster) {
        case "localnet":
            return "http://localhost:8899";
        case "civicnet":
            return CIVICNET_URL;
        default:
            return clusterApiUrl(cluster);
    }
};

/**
 * If SOLANA_CLUSTER_URL is set, create a connection to it
 * Otherwise, create a connection to the passed-in cluster
 * @param cluster ExtendedCluster
 *
 * @returns Connection
 */
export const getConnectionFromEnv = (cluster?: ExtendedCluster): Connection => {
  if (process.env.SOLANA_CLUSTER_URL)
    return getConnection(process.env.SOLANA_CLUSTER_URL);

  if (!cluster)
    throw new Error("Either pass a cluster or set SOLANA_CLUSTER_URL");

  return getConnection(getClusterUrl(cluster));
};

export const prettyPrint = (token: GatewayToken): string =>
    JSON.stringify(
        {
            issuingGatekeeper: token.issuingGatekeeper.toBase58(),
            gatekeeperNetwork: token.gatekeeperNetwork.toBase58(),
            owner: token.owner.toBase58(),
            state: token.state,
            publicKey: token.publicKey.toBase58(),
            programId: token.programId.toBase58(),
            expiryTime: token.expiryTime,
        },
        null,
        1
    );

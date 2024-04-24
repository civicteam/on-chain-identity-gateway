import { Connection } from "@solana/web3.js";
import { HashOrNonce } from "./connection";

export const getOrCreateBlockhashOrNonce = (
  connection: Connection,
  blockhashOrNonce: HashOrNonce | undefined,
): Promise<HashOrNonce> => {
  if (blockhashOrNonce) return Promise.resolve(blockhashOrNonce);
  return (
    connection
      .getLatestBlockhash()
      // convert the result to the structure required for HashOrNonce
      .then(({ blockhash }) => ({ recentBlockhash: blockhash }))
  );
};

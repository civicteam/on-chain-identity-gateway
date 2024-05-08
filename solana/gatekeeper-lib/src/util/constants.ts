import { Commitment, PublicKey } from "@solana/web3.js";

export const REGISTER = "./register.csv";

// Should equal the contents of solana/program/program-id.md
export const PROGRAM_ID: PublicKey = new PublicKey(
  "gatem74V238djXdzWnJf94Wo1DcnuGkfijbf3AuBhfs",
);
export const SOLANA_COMMITMENT: Commitment = "confirmed";

// Max compute limits needed for the program
// This is only relevant when paying priority fees, which are calculated based on the compute units used
export const CU_LIMIT = 100_000;

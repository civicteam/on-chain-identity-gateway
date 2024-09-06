/* Autogenerated file. Do not edit manually. */
// @ts-nocheck
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  GatedERC2771Upgradeable,
  GatedERC2771UpgradeableInterface,
} from "../../contracts/GatedERC2771Upgradeable";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "gatewayToken",
        type: "address",
      },
    ],
    name: "IsGated__InvalidGatewayToken",
    type: "error",
  },
  {
    inputs: [],
    name: "IsGated__ZeroContractAddress",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint8",
        name: "version",
        type: "uint8",
      },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "forwarder",
        type: "address",
      },
    ],
    name: "isTrustedForwarder",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export class GatedERC2771Upgradeable__factory {
  static readonly abi = _abi;
  static createInterface(): GatedERC2771UpgradeableInterface {
    return new Interface(_abi) as GatedERC2771UpgradeableInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): GatedERC2771Upgradeable {
    return new Contract(
      address,
      _abi,
      runner
    ) as unknown as GatedERC2771Upgradeable;
  }
}

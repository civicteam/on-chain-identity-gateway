/* Autogenerated file. Do not edit manually. */
// @ts-nocheck
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../common";
import type {
  ERC3525Upgradeable,
  ERC3525UpgradeableInterface,
} from "../../../@solvprotocol/erc-3525/ERC3525Upgradeable";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "_approved",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "_tokenId",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "_operator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "_approved",
        type: "bool",
      },
    ],
    name: "ApprovalForAll",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "_tokenId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "_operator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_value",
        type: "uint256",
      },
    ],
    name: "ApprovalValue",
    type: "event",
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
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "metadataDescriptor",
        type: "address",
      },
    ],
    name: "SetMetadataDescriptor",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "_tokenId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "_oldSlot",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "_newSlot",
        type: "uint256",
      },
    ],
    name: "SlotChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "_to",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "_tokenId",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "_fromTokenId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "_toTokenId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_value",
        type: "uint256",
      },
    ],
    name: "TransferValue",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId_",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "operator_",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to_",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId_",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId_",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "to_",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value_",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner_",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId_",
        type: "uint256",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "contractURI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId_",
        type: "uint256",
      },
    ],
    name: "getApproved",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner_",
        type: "address",
      },
      {
        internalType: "address",
        name: "operator_",
        type: "address",
      },
    ],
    name: "isApprovedForAll",
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
  {
    inputs: [],
    name: "metadataDescriptor",
    outputs: [
      {
        internalType: "contract IERC3525MetadataDescriptorUpgradeable",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId_",
        type: "uint256",
      },
    ],
    name: "ownerOf",
    outputs: [
      {
        internalType: "address",
        name: "owner_",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from_",
        type: "address",
      },
      {
        internalType: "address",
        name: "to_",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId_",
        type: "uint256",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from_",
        type: "address",
      },
      {
        internalType: "address",
        name: "to_",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId_",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data_",
        type: "bytes",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator_",
        type: "address",
      },
      {
        internalType: "bool",
        name: "approved_",
        type: "bool",
      },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId_",
        type: "uint256",
      },
    ],
    name: "slotOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "slot_",
        type: "uint256",
      },
    ],
    name: "slotURI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
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
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "index_",
        type: "uint256",
      },
    ],
    name: "tokenByIndex",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner_",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "index_",
        type: "uint256",
      },
    ],
    name: "tokenOfOwnerByIndex",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId_",
        type: "uint256",
      },
    ],
    name: "tokenURI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "fromTokenId_",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "to_",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value_",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "uint256",
        name: "newTokenId",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from_",
        type: "address",
      },
      {
        internalType: "address",
        name: "to_",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId_",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "fromTokenId_",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "toTokenId_",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "value_",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "valueDecimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b50612b80806100206000396000f3fe6080604052600436106101615760003560e01c80634f6ccce7116100c15780639cc7f7081161007a5780639cc7f708146103a3578063a22cb465146103c3578063b88d4fde146103e3578063c87b56dd146103f6578063e345e0bc14610416578063e8a3d48514610436578063e985e9c51461044b57600080fd5b80634f6ccce7146102fb5780636352211e1461031b57806370a082311461033b578063840f71131461035b5780638cb0a5111461037b57806395d89b411461038e57600080fd5b806318160ddd1161011e57806318160ddd1461024b57806323b872dd14610260578063263f3e7e146102735780632f745c5914610293578063310ed7f0146102b35780633e7e8669146102c657806342842e0e146102e857600080fd5b806301ffc9a71461016657806306fdde031461019b578063081812fc146101bd578063095ea7b3146101f557806309c3dd871461020a5780630f485c021461022a575b600080fd5b34801561017257600080fd5b50610186610181366004612484565b61046b565b60405190151581526020015b60405180910390f35b3480156101a757600080fd5b506101b061050e565b60405161019291906124f1565b3480156101c957600080fd5b506101dd6101d8366004612504565b6105a0565b6040516001600160a01b039091168152602001610192565b610208610203366004612534565b6105f2565b005b34801561021657600080fd5b506101b0610225366004612504565b6106d2565b61023d61023836600461255e565b6107c4565b604051908152602001610192565b34801561025757600080fd5b5060385461023d565b61020861026e366004612593565b6107fc565b34801561027f57600080fd5b5061023d61028e366004612504565b61082d565b34801561029f57600080fd5b5061023d6102ae366004612534565b610875565b6102086102c13660046125bf565b610916565b3480156102d257600080fd5b5060355460405160ff9091168152602001610192565b6102086102f6366004612593565b61092c565b34801561030757600080fd5b5061023d610316366004612504565b610947565b34801561032757600080fd5b506101dd610336366004612504565b6109d8565b34801561034757600080fd5b5061023d6103563660046125eb565b610a48565b34801561036757600080fd5b50603b546101dd906001600160a01b031681565b61020861038936600461255e565b610ad0565b34801561039a57600080fd5b506101b0610b8f565b3480156103af57600080fd5b5061023d6103be366004612504565b610b9e565b3480156103cf57600080fd5b506102086103de366004612614565b610be6565b6102086103f13660046126ba565b610bf5565b34801561040257600080fd5b506101b0610411366004612504565b610c27565b34801561042257600080fd5b5061023d610431366004612765565b610cc6565b34801561044257600080fd5b506101b0610cfa565b34801561045757600080fd5b50610186610466366004612791565b610df4565b60006001600160e01b031982166301ffc9a760e01b148061049c57506001600160e01b03198216630354d60560e61b145b806104b757506001600160e01b031982166380ac58cd60e01b145b806104d257506001600160e01b031982166370b0048160e11b145b806104ed57506001600160e01b0319821663780e9d6360e01b145b8061050857506001600160e01b03198216635b5e139f60e01b145b92915050565b60606033805461051d906127bb565b80601f0160208091040260200160405190810160405280929190818152602001828054610549906127bb565b80156105965780601f1061056b57610100808354040283529160200191610596565b820191906000526020600020905b81548152906001019060200180831161057957829003601f168201915b5050505050905090565b60006105ab82610e26565b6000828152603960205260409020546038805490919081106105cf576105cf6127f5565b60009182526020909120600460069092020101546001600160a01b031692915050565b60006105fd826109d8565b9050806001600160a01b0316836001600160a01b0316036106395760405162461bcd60e51b81526004016106309061280b565b60405180910390fd5b336001600160a01b038216148061065557506106558133610df4565b6106c35760405162461bcd60e51b815260206004820152603960248201527f455243333532353a20617070726f76652063616c6c6572206973206e6f74206f6044820152781ddb995c881b9bdc88185c1c1c9bdd995908199bdc88185b1b603a1b6064820152608401610630565b6106cd8383610e4e565b505050565b606060006106eb60408051602081019091526000815290565b603b549091506001600160a01b031661074b57600081511161071c57604051806020016040528060008152506107bd565b8061072684610ee5565b60405160200161073792919061284d565b6040516020818303038152906040526107bd565b603b54604051633601bfc560e11b8152600481018590526001600160a01b0390911690636c037f8a906024015b600060405180830381865afa158015610795573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526107bd919081019061288d565b9392505050565b60006107d1338584610f78565b6107da84611008565b90506107f183826107ea8761082d565b6000611012565b6107bd84828461113c565b6108063382611434565b6108225760405162461bcd60e51b815260040161063090612904565b6106cd838383611493565b600061083882610e26565b60008281526039602052604090205460388054909190811061085c5761085c6127f5565b9060005260206000209060060201600101549050919050565b600061088083610a48565b82106108d95760405162461bcd60e51b815260206004820152602260248201527f455243333532353a206f776e657220696e646578206f7574206f6620626f756e604482015261647360f01b6064820152608401610630565b6001600160a01b0383166000908152603a60205260409020805483908110610903576109036127f5565b9060005260206000200154905092915050565b610921338483610f78565b6106cd83838361113c565b6106cd83838360405180602001604052806000815250610bf5565b600061095260385490565b82106109ac5760405162461bcd60e51b815260206004820152602360248201527f455243333532353a20676c6f62616c20696e646578206f7574206f6620626f756044820152626e647360e81b6064820152608401610630565b603882815481106109bf576109bf6127f5565b9060005260206000209060060201600001549050919050565b60006109e382610e26565b600082815260396020526040902054603880549091908110610a0757610a076127f5565b60009182526020909120600360069092020101546001600160a01b0316905080610a435760405162461bcd60e51b815260040161063090612956565b919050565b60006001600160a01b038216610ab45760405162461bcd60e51b815260206004820152602b60248201527f455243333532353a2062616c616e636520717565727920666f7220746865207a60448201526a65726f206164647265737360a81b6064820152608401610630565b506001600160a01b03166000908152603a602052604090205490565b6000610adb846109d8565b9050806001600160a01b0316836001600160a01b031603610b0e5760405162461bcd60e51b81526004016106309061280b565b610b183385611434565b610b7e5760405162461bcd60e51b815260206004820152603160248201527f455243333532353a20617070726f76652063616c6c6572206973206e6f74206f6044820152701ddb995c881b9bdc88185c1c1c9bdd9959607a1b6064820152608401610630565b610b898484846115f4565b50505050565b60606034805461051d906127bb565b6000610ba982610e26565b600082815260396020526040902054603880549091908110610bcd57610bcd6127f5565b9060005260206000209060060201600201549050919050565b610bf133838361172c565b5050565b610bff3383611434565b610c1b5760405162461bcd60e51b815260040161063090612904565b610b89848484846117f6565b6060610c3282610e26565b6000610c4960408051602081019091526000815290565b603b549091506001600160a01b0316610c95576000815111610c7a57604051806020016040528060008152506107bd565b80610c8484610ee5565b604051602001610737929190612989565b603b546040516344a5a61760e11b8152600481018590526001600160a01b039091169063894b4c2e90602401610778565b6000610cd183610e26565b5060009182526037602090815260408084206001600160a01b0393909316845291905290205490565b60606000610d1360408051602081019091526000815290565b603b549091506001600160a01b0316610d73576000815111610d445760405180602001604052806000815250610dee565b80610d4e30611869565b604051602001610d5f9291906129b8565b604051602081830303815290604052610dee565b603b60009054906101000a90046001600160a01b03166001600160a01b031663725fa09c6040518163ffffffff1660e01b8152600401600060405180830381865afa158015610dc6573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610dee919081019061288d565b91505090565b6001600160a01b039182166000908152603a602090815260408083209390941682526002909201909152205460ff1690565b610e2f8161187f565b610e4b5760405162461bcd60e51b815260040161063090612956565b50565b600081815260396020526040902054603880548492908110610e7257610e726127f5565b6000918252602090912060069091020160040180546001600160a01b0319166001600160a01b0392831617905581908316610eac826109d8565b6001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a45050565b60606000610ef2836118cb565b600101905060008167ffffffffffffffff811115610f1257610f1261264b565b6040519080825280601f01601f191660200182016040528015610f3c576020820181803683370190505b5090508181016020015b600019016f181899199a1a9b1b9c1cb0b131b232b360811b600a86061a8153600a8504945084610f4657509392505050565b6000610f848385610cc6565b9050610f908484611434565b158015610f9f57506000198114155b15610b895781811015610ff45760405162461bcd60e51b815260206004820152601f60248201527f455243333532353a20696e73756666696369656e7420616c6c6f77616e6365006044820152606401610630565b610b8983856110038585612a12565b6115f4565b60006105086119a3565b6001600160a01b0384166110725760405162461bcd60e51b815260206004820152602160248201527f455243333532353a206d696e7420746f20746865207a65726f206164647265736044820152607360f81b6064820152608401610630565b826000036110cc5760405162461bcd60e51b815260206004820152602160248201527f455243333532353a2063616e6e6f74206d696e74207a65726f20746f6b656e496044820152601960fa1b6064820152608401610630565b6110d58361187f565b156111225760405162461bcd60e51b815260206004820152601d60248201527f455243333532353a20746f6b656e20616c7265616479206d696e7465640000006044820152606401610630565b61112d8484846119bd565b6111378382611a83565b610b89565b6111458361187f565b6111a15760405162461bcd60e51b815260206004820152602760248201527f455243333532353a207472616e736665722066726f6d20696e76616c696420746044820152661bdad95b88125160ca1b6064820152608401610630565b6111aa8261187f565b6112045760405162461bcd60e51b815260206004820152602560248201527f455243333532353a207472616e7366657220746f20696e76616c696420746f6b604482015264195b88125160da1b6064820152608401610630565b600083815260396020526040812054603880549091908110611228576112286127f5565b9060005260206000209060060201905060006038603960008681526020019081526020016000205481548110611260576112606127f5565b9060005260206000209060060201905082826002015410156112d75760405162461bcd60e51b815260206004820152602a60248201527f455243333532353a20696e73756666696369656e742062616c616e636520666f60448201526939103a3930b739b332b960b11b6064820152608401610630565b80600101548260010154146113455760405162461bcd60e51b815260206004820152602e60248201527f455243333532353a207472616e7366657220746f20746f6b656e20776974682060448201526d191a5999995c995b9d081cdb1bdd60921b6064820152608401610630565b828260020160008282546113599190612a12565b92505081905550828160020160008282546113749190612a25565b9091555050604051838152849086907f0b2aac84f3ec956911fd78eae5311062972ff949f38412e8da39069d9f068cc69060200160405180910390a36113cb85858560405180602001604052806000815250611b08565b61142d5760405162461bcd60e51b815260206004820152602d60248201527f455243333532353a207472616e736665722072656a656374656420627920455260448201526c21999a991aa932b1b2b4bb32b960991b6064820152608401610630565b5050505050565b600080611440836109d8565b9050806001600160a01b0316846001600160a01b0316148061146757506114678185610df4565b8061148b5750836001600160a01b0316611480846105a0565b6001600160a01b0316145b949350505050565b826001600160a01b03166114a6826109d8565b6001600160a01b0316146115085760405162461bcd60e51b8152602060048201526024808201527f455243333532353a207472616e736665722066726f6d20696e76616c6964206f6044820152633bb732b960e11b6064820152608401610630565b6001600160a01b03821661156c5760405162461bcd60e51b815260206004820152602560248201527f455243333532353a207472616e7366657220746f20746865207a65726f206164604482015264647265737360d81b6064820152608401610630565b60006115778261082d565b9050600061158483610b9e565b9050611591600084610e4e565b61159a83611c7a565b6115a48584611d25565b6115ae8484611e46565b82846001600160a01b0316866001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60405160405180910390a461142d565b6001600160a01b03821661165d5760405162461bcd60e51b815260206004820152602a60248201527f455243333532353a20617070726f76652076616c756520746f20746865207a65604482015269726f206164647265737360b01b6064820152608401610630565b6116678284611ecf565b6116cd5760008381526039602052604090205460388054909190811061168f5761168f6127f5565b60009182526020808320600692909202909101600501805460018101825590835291200180546001600160a01b0319166001600160a01b0384161790555b60008381526037602090815260408083206001600160a01b038616808552908352928190208490555183815285917f621b050de0ad08b51d19b48b3e6df75348c4de6bdd93e81b252ca62e28265b1b91015b60405180910390a3505050565b816001600160a01b0316836001600160a01b03160361178d5760405162461bcd60e51b815260206004820152601a60248201527f455243333532353a20617070726f766520746f2063616c6c65720000000000006044820152606401610630565b6001600160a01b038381166000818152603a602090815260408083209487168084526002909501825291829020805460ff191686151590811790915591519182527f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31910161171f565b611801848484611493565b61180d84848484611fa2565b610b895760405162461bcd60e51b815260206004820152602760248201527f455243333532353a207472616e7366657220746f206e6f6e204552433732315260448201526632b1b2b4bb32b960c91b6064820152608401610630565b60606105086001600160a01b03831660146120e8565b6038546000901580159061050857506000828152603960205260409020546038805484929081106118b2576118b26127f5565b9060005260206000209060060201600001541492915050565b60008072184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b831061190a5772184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b830492506040015b6d04ee2d6d415b85acef81000000008310611936576d04ee2d6d415b85acef8100000000830492506020015b662386f26fc10000831061195457662386f26fc10000830492506010015b6305f5e100831061196c576305f5e100830492506008015b612710831061198057612710830492506004015b60648310611992576064830492506002015b600a83106105085760010192915050565b60368054600091826119b483612a38565b91905055905090565b6040805160c081018252838152602080820184905260008284018190526001600160a01b038716606084015260808301819052835181815291820190935260a08201529050611a0b81612284565b611a158484611e46565b60405183906001600160a01b038616906000907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef908290a4816000847fe4f48c240d3b994948aa54f3e2f5fca59263dfe1d52b6e4cf39a5d249b5ccb6560405160405180910390a450505050565b600082815260396020526040902054603880548392908110611aa757611aa76127f5565b90600052602060002090600602016002016000828254611ac79190612a25565b909155505060405181815282906000907f0b2aac84f3ec956911fd78eae5311062972ff949f38412e8da39069d9f068cc69060200160405180910390a35050565b600080611b14856109d8565b9050803b63ffffffff1615611c6e576040516301ffc9a760e01b8152629ce20b60e01b60048201526001600160a01b038216906301ffc9a790602401602060405180830381865afa925050508015611b89575060408051601f3d908101601f19168201909252611b8691810190612a51565b60015b611bc8573d808015611bb7576040519150601f19603f3d011682016040523d82523d6000602084013e611bbc565b606091505b5060019250505061148b565b8015611c6357604051629ce20b60e01b81526000906001600160a01b03841690629ce20b90611c039033908c908c908c908c90600401612a6e565b6020604051808303816000875af1158015611c22573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611c469190612aac565b6001600160e01b031916629ce20b60e01b14935061148b92505050565b60019250505061148b565b50600195945050505050565b600081815260396020526040812054603880549091908110611c9e57611c9e6127f5565b600091825260208220600560069092020190810154909250905b81811015611d16576000836005018281548110611cd757611cd76127f5565b60009182526020808320909101548783526037825260408084206001600160a01b03909216845291528120555080611d0e81612a38565b915050611cb8565b506106cd6005830160006123d6565b600081815260396020526040812054603880549091908110611d4957611d496127f5565b6000918252602080832060069290920290910160030180546001600160a01b0319166001600160a01b039485161790559184168152603a909152604081208054909190611d9890600190612a12565b90506000826000018281548110611db157611db16127f5565b90600052602060002001549050600083600101600086815260200190815260200160002054905081846000018281548110611dee57611dee6127f5565b60009182526020808320909101929092558381526001860190915260408082208390558682528120558354849080611e2857611e28612ac9565b60019003818190600052602060002001600090559055505050505050565b600081815260396020526040902054603880548492908110611e6a57611e6a6127f5565b6000918252602080832060069290920290910160030180546001600160a01b0319166001600160a01b03948516179055939091168152603a80845260408083208054858552600182810188529285208190559286529082018155825292902090910155565b600081815260396020526040812054603880548392908110611ef357611ef36127f5565b6000918252602082206005600690920201015491505b81811015611f9757600084815260396020526040902054603880546001600160a01b03881692908110611f3e57611f3e6127f5565b90600052602060002090600602016005018281548110611f6057611f606127f5565b6000918252602090912001546001600160a01b031603611f8557600192505050610508565b80611f8f81612a38565b915050611f09565b506000949350505050565b6000833b63ffffffff16156120e057604051630a85bd0160e11b81526001600160a01b0385169063150b7a0290611fe3903390899088908890600401612adf565b6020604051808303816000875af192505050801561201e575060408051601f3d908101601f1916820190925261201b91810190612aac565b60015b6120c6573d80801561204c576040519150601f19603f3d011682016040523d82523d6000602084013e612051565b606091505b5080516000036120be5760405162461bcd60e51b815260206004820152603260248201527f4552433732313a207472616e7366657220746f206e6f6e20455243373231526560448201527131b2b4bb32b91034b6b83632b6b2b73a32b960711b6064820152608401610630565b805181602001fd5b6001600160e01b031916630a85bd0160e11b14905061148b565b50600161148b565b606060006120f7836002612b1c565b612102906002612a25565b67ffffffffffffffff81111561211a5761211a61264b565b6040519080825280601f01601f191660200182016040528015612144576020820181803683370190505b509050600360fc1b8160008151811061215f5761215f6127f5565b60200101906001600160f81b031916908160001a905350600f60fb1b8160018151811061218e5761218e6127f5565b60200101906001600160f81b031916908160001a90535060006121b2846002612b1c565b6121bd906001612a25565b90505b6001811115612235576f181899199a1a9b1b9c1cb0b131b232b360811b85600f16601081106121f1576121f16127f5565b1a60f81b828281518110612207576122076127f5565b60200101906001600160f81b031916908160001a90535060049490941c9361222e81612b33565b90506121c0565b5083156107bd5760405162461bcd60e51b815260206004820181905260248201527f537472696e67733a20686578206c656e67746820696e73756666696369656e746044820152606401610630565b603880548251600090815260396020908152604080832084905560018401855593909152835160069092027f38395c5dceade9603479b177b68959049485df8aa97b39f3533039af5f4561998101928355818501517f38395c5dceade9603479b177b68959049485df8aa97b39f3533039af5f45619a820155928401517f38395c5dceade9603479b177b68959049485df8aa97b39f3533039af5f45619b84015560608401517f38395c5dceade9603479b177b68959049485df8aa97b39f3533039af5f45619c840180546001600160a01b039283166001600160a01b03199182161790915560808601517f38395c5dceade9603479b177b68959049485df8aa97b39f3533039af5f45619d8601805491909316911617905560a084015180518594610b89937f38395c5dceade9603479b177b68959049485df8aa97b39f3533039af5f45619e9091019201906123f4565b5080546000825590600052602060002090810190610e4b9190612459565b828054828255906000526020600020908101928215612449579160200282015b8281111561244957825182546001600160a01b0319166001600160a01b03909116178255602090920191600190910190612414565b50612455929150612459565b5090565b5b80821115612455576000815560010161245a565b6001600160e01b031981168114610e4b57600080fd5b60006020828403121561249657600080fd5b81356107bd8161246e565b60005b838110156124bc5781810151838201526020016124a4565b50506000910152565b600081518084526124dd8160208601602086016124a1565b601f01601f19169290920160200192915050565b6020815260006107bd60208301846124c5565b60006020828403121561251657600080fd5b5035919050565b80356001600160a01b0381168114610a4357600080fd5b6000806040838503121561254757600080fd5b6125508361251d565b946020939093013593505050565b60008060006060848603121561257357600080fd5b833592506125836020850161251d565b9150604084013590509250925092565b6000806000606084860312156125a857600080fd5b6125b18461251d565b92506125836020850161251d565b6000806000606084860312156125d457600080fd5b505081359360208301359350604090920135919050565b6000602082840312156125fd57600080fd5b6107bd8261251d565b8015158114610e4b57600080fd5b6000806040838503121561262757600080fd5b6126308361251d565b9150602083013561264081612606565b809150509250929050565b634e487b7160e01b600052604160045260246000fd5b604051601f8201601f1916810167ffffffffffffffff8111828210171561268a5761268a61264b565b604052919050565b600067ffffffffffffffff8211156126ac576126ac61264b565b50601f01601f191660200190565b600080600080608085870312156126d057600080fd5b6126d98561251d565b93506126e76020860161251d565b925060408501359150606085013567ffffffffffffffff81111561270a57600080fd5b8501601f8101871361271b57600080fd5b803561272e61272982612692565b612661565b81815288602083850101111561274357600080fd5b8160208401602083013760006020838301015280935050505092959194509250565b6000806040838503121561277857600080fd5b823591506127886020840161251d565b90509250929050565b600080604083850312156127a457600080fd5b6127ad8361251d565b91506127886020840161251d565b600181811c908216806127cf57607f821691505b6020821081036127ef57634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052603260045260246000fd5b60208082526022908201527f455243333532353a20617070726f76616c20746f2063757272656e74206f776e60408201526132b960f11b606082015260800190565b6000835161285f8184602088016124a1565b64736c6f742f60d81b90830190815283516128818160058401602088016124a1565b01600501949350505050565b60006020828403121561289f57600080fd5b815167ffffffffffffffff8111156128b657600080fd5b8201601f810184136128c757600080fd5b80516128d561272982612692565b8181528560208385010111156128ea57600080fd5b6128fb8260208301602086016124a1565b95945050505050565b60208082526032908201527f455243333532353a207472616e736665722063616c6c6572206973206e6f74206040820152711bdddb995c881b9bdc88185c1c1c9bdd995960721b606082015260800190565b602080825260199082015278115490cccd4c8d4e881a5b9d985b1a59081d1bdad95b881251603a1b604082015260600190565b6000835161299b8184602088016124a1565b8351908301906129af8183602088016124a1565b01949350505050565b600083516129ca8184602088016124a1565b68636f6e74726163742f60b81b90830190815283516129f08160098401602088016124a1565b01600901949350505050565b634e487b7160e01b600052601160045260246000fd5b81810381811115610508576105086129fc565b80820180821115610508576105086129fc565b600060018201612a4a57612a4a6129fc565b5060010190565b600060208284031215612a6357600080fd5b81516107bd81612606565b60018060a01b038616815284602082015283604082015282606082015260a060808201526000612aa160a08301846124c5565b979650505050505050565b600060208284031215612abe57600080fd5b81516107bd8161246e565b634e487b7160e01b600052603160045260246000fd5b6001600160a01b0385811682528416602082015260408101839052608060608201819052600090612b12908301846124c5565b9695505050505050565b8082028115828204841417610508576105086129fc565b600081612b4257612b426129fc565b50600019019056fea26469706673582212201c4dd86289d23b9165cfe8afa7ad8d73949b79e7a048a9c7230640c44fc96bab64736f6c63430008130033";

type ERC3525UpgradeableConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ERC3525UpgradeableConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ERC3525Upgradeable__factory extends ContractFactory {
  constructor(...args: ERC3525UpgradeableConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(overrides || {});
  }
  override deploy(overrides?: NonPayableOverrides & { from?: string }) {
    return super.deploy(overrides || {}) as Promise<
      ERC3525Upgradeable & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): ERC3525Upgradeable__factory {
    return super.connect(runner) as ERC3525Upgradeable__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ERC3525UpgradeableInterface {
    return new Interface(_abi) as ERC3525UpgradeableInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): ERC3525Upgradeable {
    return new Contract(address, _abi, runner) as unknown as ERC3525Upgradeable;
  }
}

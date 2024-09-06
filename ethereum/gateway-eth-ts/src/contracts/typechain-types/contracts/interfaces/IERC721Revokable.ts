/* Autogenerated file. Do not edit manually. */
// @ts-nocheck
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "../../common";

export interface IERC721RevokableInterface extends Interface {
  getFunction(nameOrSignature: "revoke"): FunctionFragment;

  getEvent(nameOrSignatureOrTopic: "Revoke"): EventFragment;

  encodeFunctionData(
    functionFragment: "revoke",
    values: [BigNumberish]
  ): string;

  decodeFunctionResult(functionFragment: "revoke", data: BytesLike): Result;
}

export namespace RevokeEvent {
  export type InputTuple = [tokenId: BigNumberish];
  export type OutputTuple = [tokenId: bigint];
  export interface OutputObject {
    tokenId: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface IERC721Revokable extends BaseContract {
  connect(runner?: ContractRunner | null): IERC721Revokable;
  waitForDeployment(): Promise<this>;

  interface: IERC721RevokableInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  revoke: TypedContractMethod<[tokenId: BigNumberish], [void], "nonpayable">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "revoke"
  ): TypedContractMethod<[tokenId: BigNumberish], [void], "nonpayable">;

  getEvent(
    key: "Revoke"
  ): TypedContractEvent<
    RevokeEvent.InputTuple,
    RevokeEvent.OutputTuple,
    RevokeEvent.OutputObject
  >;

  filters: {
    "Revoke(uint256)": TypedContractEvent<
      RevokeEvent.InputTuple,
      RevokeEvent.OutputTuple,
      RevokeEvent.OutputObject
    >;
    Revoke: TypedContractEvent<
      RevokeEvent.InputTuple,
      RevokeEvent.OutputTuple,
      RevokeEvent.OutputObject
    >;
  };
}

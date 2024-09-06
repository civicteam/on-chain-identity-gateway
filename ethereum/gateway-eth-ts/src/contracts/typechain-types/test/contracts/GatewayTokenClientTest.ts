/* Autogenerated file. Do not edit manually. */
// @ts-nocheck
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
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

export interface GatewayTokenClientTestInterface extends Interface {
  getFunction(nameOrSignature: "testGated"): FunctionFragment;

  getEvent(nameOrSignatureOrTopic: "Success"): EventFragment;

  encodeFunctionData(functionFragment: "testGated", values?: undefined): string;

  decodeFunctionResult(functionFragment: "testGated", data: BytesLike): Result;
}

export namespace SuccessEvent {
  export type InputTuple = [];
  export type OutputTuple = [];
  export interface OutputObject {}
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface GatewayTokenClientTest extends BaseContract {
  connect(runner?: ContractRunner | null): GatewayTokenClientTest;
  waitForDeployment(): Promise<this>;

  interface: GatewayTokenClientTestInterface;

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

  testGated: TypedContractMethod<[], [void], "nonpayable">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "testGated"
  ): TypedContractMethod<[], [void], "nonpayable">;

  getEvent(
    key: "Success"
  ): TypedContractEvent<
    SuccessEvent.InputTuple,
    SuccessEvent.OutputTuple,
    SuccessEvent.OutputObject
  >;

  filters: {
    "Success()": TypedContractEvent<
      SuccessEvent.InputTuple,
      SuccessEvent.OutputTuple,
      SuccessEvent.OutputObject
    >;
    Success: TypedContractEvent<
      SuccessEvent.InputTuple,
      SuccessEvent.OutputTuple,
      SuccessEvent.OutputObject
    >;
  };
}

import { Command, flags } from "@oclif/command";
import { BaseProvider } from '@ethersproject/providers';
import { GatewayToken } from "../contracts/GatewayToken";
import {
		privateKeyFlag,
		gatewayTokenAddressFlag,
		networkFlag,
		gasPriceFeeFlag,
		confirmationsFlag,
} from "../utils/flags";
import { TxBase } from "../utils/tx";
import { BigNumber, utils, Wallet } from "ethers";
import { mnemonicSigner, privateKeySigner } from "../utils/signer";
import { getExpirationTime } from "../utils/time";

export default class RefreshToken extends Command {
	static description = "Refresh existing identity token with TokenID for Ethereum address";

	static examples = [
		`$ gateway refresh 10 0x893F4Be53274353CD3379C87C8fd1cb4f8458F94
		`,
	];

	static flags = {
		help: flags.help({ char: "h" }),
		privateKey: privateKeyFlag(),
		gatewayTokenAddress: gatewayTokenAddressFlag(),
		network: networkFlag(),
		gasPriceFee: gasPriceFeeFlag(),
		confirmations: confirmationsFlag(),
	};

	static args = [
		{
			name: "tokenID",
			required: true,
			description: "Token ID number to refresh",
			parse: (input: string) => BigNumber.from(input),
		},
		{
			name: "expiry",
			required: false,
			description: "The new expiry time in seconds for the gateway token (default 14 days)",
			parse: (input: string) => Number(input),
		},
	];

	async run() {
		const { args, flags } = this.parse(RefreshToken);

		let pk = flags.privateKey;
		const provider:BaseProvider = flags.network;
		let signer: Wallet
		const confirmations = flags.confirmations;
		let tx:any;

		if (utils.isValidMnemonic(pk)) {
			signer = mnemonicSigner(pk, provider)
		} else {
			signer = privateKeySigner(pk, provider)
		}

		const tokenID: BigNumber = args.tokenID;
		const now = Math.floor(Date.now() / 1000);
		const expiry: number = args.expiry;

		let expirationDate = getExpirationTime(expiry);
		var days = Math.floor((expirationDate - now) / 86400);

		const gatewayTokenAddress: string = flags.gatewayTokenAddress;

		this.log(`Refreshing existing token with TokenID:
			${tokenID.toString()} 
			for ${days} days
			on GatewayToken ${gatewayTokenAddress} contract`);
		
		const gatewayToken = new GatewayToken(signer, gatewayTokenAddress);

		let gasPrice = await flags.gasPriceFee;
		let gasLimit = await gatewayToken.contract.estimateGas.setExpiration(tokenID, expirationDate);

		let txParams: TxBase = {
			gasLimit: gasLimit,
			gasPrice: BigNumber.from(utils.parseUnits(String(gasPrice), 'gwei') ),
		};

		if (confirmations > 0) {
			tx = await(await gatewayToken.setExpiration(tokenID, expirationDate, txParams)).wait(confirmations);
		} else {
			tx = await gatewayToken.setExpiration(tokenID, expirationDate, txParams);
		}

		this.log(
			`Refreshed token with: ${tokenID.toString()} tokenID for ${days} days. TxHash: ${(confirmations > 0) ? tx.transactionHash : tx.hash}`
		);
	}
}
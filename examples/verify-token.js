const { GatewayETH } = require('../dist/index.js');
const { getDefaultProvider, Wallet } = require('ethers');
require("dotenv/config");

(async function() {
    const provider = getDefaultProvider('ropsten', {infura: process.env.INFURA_KEY});
    let wallet = new Wallet(`0x${process.env.PRIVATE_KEY}`);
    wallet = wallet.connect(provider);

    const gtLib = new GatewayETH(
        provider,
        wallet
    );
    await gtLib.init()

    const testUser = '0x57AB42d4fa756b6956b0cAf986a5f53bA90D9e28';
    let tx = await gtLib.verify(testUser);
})();
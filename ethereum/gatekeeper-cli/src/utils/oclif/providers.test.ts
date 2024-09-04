import {BaseProvider, JsonRpcProvider} from '@ethersproject/providers'
import {getProvider, getLocalhostProvider} from './providers'
import assert = require('assert');

describe('Check ethers provider', function () {
  let provider: BaseProvider
  const mainnetNetworkID = 1
  const sepoliaNetworkID = 11_155_111

  it('Try connect to mainnet ethers provider, check network ID', async () => {
    provider = getProvider('ethereum')
    const networkId = (await provider.getNetwork()).chainId

    assert.equal(networkId, mainnetNetworkID)
  })

  it('Try connect to sepolia ethers provider, check network ID', async () => {
    provider = getProvider('sepolia')
    const networkId = (await provider.getNetwork()).chainId

    assert.equal(networkId, sepoliaNetworkID)
  })

  it('Try connect to localhost provider, check connection URL', () => {
    const provider: JsonRpcProvider = getLocalhostProvider()
    assert.equal(provider.connection.url, 'http://localhost:8545')
  })
})

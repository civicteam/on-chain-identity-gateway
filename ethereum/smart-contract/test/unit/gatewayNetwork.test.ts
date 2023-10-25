import { ethers } from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { GatewayNetwork, GatewayNetwork__factory } from '../../typechain-types' ;
import { utils } from 'ethers';

describe('GatewayNetworkToken', async () => {
    let primaryAuthority: SignerWithAddress;
    let alice: SignerWithAddress;
    let bob: SignerWithAddress;
    let deployer: SignerWithAddress;
    let stableCoin: SignerWithAddress;

    let gatekeeperNetworkContract: GatewayNetwork;

    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
    const DEFAULT_PASS_EXPIRE_IN_SECOUNDS = 1000;

    const getDefaultNetwork = (primaryAuthority: string, gatekeepers?: string[], passExpireTimeInSeconds?: number): GatewayNetwork.GatekeeperNetworkDataStruct => {
        return {
            primaryAuthority,
            name: utils.formatBytes32String('default'),
            passExpireTimeInSeconds: passExpireTimeInSeconds ? passExpireTimeInSeconds : DEFAULT_PASS_EXPIRE_IN_SECOUNDS,
            networkFeatures: 0,
            networkFees: [{tokenAddress: ZERO_ADDRESS, issueFee: 0, refreshFee: 0, expireFee: 0}],
            supportedTokens: [ZERO_ADDRESS],
            gatekeepers: gatekeepers ? gatekeepers : []
        }
    }

    beforeEach('setup', async () => {
        [deployer, primaryAuthority, alice, bob, stableCoin] = await ethers.getSigners();

        const gatewayNetworkFactory = await new GatewayNetwork__factory(deployer);

        gatekeeperNetworkContract = await gatewayNetworkFactory.deploy();
        await gatekeeperNetworkContract.deployed();
    })


    describe('Gatekeeper Network Creation', async () => {
        it('creates a new network with a primary authority', async () => {
            const defaultNetwork = getDefaultNetwork(primaryAuthority.address, []);
            await gatekeeperNetworkContract.connect(deployer).createNetwork(defaultNetwork, {gasLimit: 300000});

            const network = await gatekeeperNetworkContract._networks(defaultNetwork.name);
            const isGatekeeper = await gatekeeperNetworkContract.isGateKeeper(defaultNetwork.name, deployer.address);

            expect(network.name).to.equal(defaultNetwork.name);
            expect(network.primaryAuthority).to.equal(primaryAuthority.address);
            expect(isGatekeeper).to.be.false;
        });

        it('creates a new network with gatekeepers', async () => {
            const defaultNetwork = getDefaultNetwork(primaryAuthority.address, [alice.address]);
            await gatekeeperNetworkContract.connect(deployer).createNetwork(defaultNetwork, {gasLimit: 300000});

            const isGatekeeper = await gatekeeperNetworkContract.isGateKeeper(defaultNetwork.name, alice.address);

            expect(isGatekeeper).to.be.true;
        });
        it('cannot create a new network zero address primary authority', async () => {
            const defaultNetwork = getDefaultNetwork(ZERO_ADDRESS, []);
            await expect(gatekeeperNetworkContract.connect(deployer).createNetwork(defaultNetwork, {gasLimit: 300000})).to.be.rejectedWith('Network primary authority cannot be zero address');
        });
        it('cannot create a new network with no name', async () => {
            const defaultNetwork = getDefaultNetwork(ZERO_ADDRESS, []);
            defaultNetwork.name = utils.formatBytes32String('');

            await expect(gatekeeperNetworkContract.connect(deployer).createNetwork(defaultNetwork, {gasLimit: 300000})).to.be.rejectedWith('Network name cannot be an empty string');
        });
        it('cannot create a new network with a network name that already exist', async () => {
            const defaultNetwork = getDefaultNetwork(primaryAuthority.address, [alice.address]);
            await gatekeeperNetworkContract.connect(deployer).createNetwork(defaultNetwork, {gasLimit: 300000});

            await expect(gatekeeperNetworkContract.connect(deployer).createNetwork(defaultNetwork, {gasLimit: 300000})).to.be.revertedWithCustomError(gatekeeperNetworkContract, 'GatewayNetworkAlreadyExists');
        });
    })

    describe('Gatekeeper Network Update', async () => {

        beforeEach('create network', async () => {
            const defaultNetwork = getDefaultNetwork(primaryAuthority.address, []);
            await gatekeeperNetworkContract.connect(deployer).createNetwork(defaultNetwork, {gasLimit: 300000});
        });

        it('can update the primary authority of a network if called by the current primary authority', async () => {
            const updatedNetwork = getDefaultNetwork(alice.address, []);
            await gatekeeperNetworkContract.connect(primaryAuthority).updateNetwork(0, updatedNetwork, {gasLimit: 300000});

            const network = await gatekeeperNetworkContract._networks(updatedNetwork.name);

            expect(network.primaryAuthority).to.equal(alice.address);
        });
        it('can update the pass expire time if called by primary authority', async () => {
            // given
            const updatedNetwork = getDefaultNetwork(primaryAuthority.address, [], 500);

            const network = await gatekeeperNetworkContract._networks(updatedNetwork.name);
            expect(network.passExpireTimeInSeconds).to.be.eq(DEFAULT_PASS_EXPIRE_IN_SECOUNDS);

            //when
            await gatekeeperNetworkContract.connect(primaryAuthority).updateNetwork(1, updatedNetwork, {gasLimit: 300000});

            //then
            const resolvedUpdatedNetwork = await gatekeeperNetworkContract._networks(updatedNetwork.name);
            expect(resolvedUpdatedNetwork.passExpireTimeInSeconds).to.be.eq(500);
        });
        it('can update supported tokens if called by primary authority', async () => {
            // given
            const updatedNetwork = getDefaultNetwork(primaryAuthority.address);
            updatedNetwork.supportedTokens = [stableCoin.address];

            const currentSupportedTokens = await gatekeeperNetworkContract.supportedTokens(updatedNetwork.name);
            expect(currentSupportedTokens.length).to.be.eq(1);
            expect(currentSupportedTokens[0]).to.be.eq(ZERO_ADDRESS);

            //when
            await gatekeeperNetworkContract.connect(primaryAuthority).updateNetwork(3, updatedNetwork, {gasLimit: 300000});

            //then
            const newSupportedTokens = await gatekeeperNetworkContract.supportedTokens(updatedNetwork.name);
            expect(newSupportedTokens.length).to.be.eq(1);
            expect(newSupportedTokens[0]).to.be.eq(stableCoin.address);
        });
        it('can update gatekeepers if called by primary authority', async () => {
            // given
            const updatedNetwork = getDefaultNetwork(primaryAuthority.address);
            updatedNetwork.gatekeepers = [bob.address, primaryAuthority.address];

            const currentGatekeepers = await gatekeeperNetworkContract.gatekeepersOnNetwork(updatedNetwork.name);
            expect(currentGatekeepers.length).to.be.eq(0);

            //when
            await gatekeeperNetworkContract.connect(primaryAuthority).updateNetwork(4, updatedNetwork, {gasLimit: 300000});

            //then
            const newGatekeepers = await gatekeeperNetworkContract.gatekeepersOnNetwork(updatedNetwork.name);
            expect(newGatekeepers.length).to.be.eq(2);
            expect(newGatekeepers[0]).to.be.eq(bob.address);
            expect(newGatekeepers[1]).to.be.eq(primaryAuthority.address);
        });
        it('cannot update the primary authority of a network if not current primary authority', async () => {
            const updatedNetwork = getDefaultNetwork(alice.address);
            await expect(gatekeeperNetworkContract.connect(alice).updateNetwork(0, updatedNetwork, {gasLimit: 300000})).to.be.rejectedWith("Only the primary authority can perform this action");
        });
        it('cannot update network if it does not exist', async () => {
            const updatedNetwork = getDefaultNetwork(primaryAuthority.address, []);
            updatedNetwork.name = utils.formatBytes32String('not-default-name');
            await expect(gatekeeperNetworkContract.connect(primaryAuthority).updateNetwork(0, updatedNetwork, {gasLimit: 300000})).to.be.rejectedWith("Network does not exist");
        });
        it('cannot update the primary authority of a network to zero address', async () => {
            const updatedNetwork = getDefaultNetwork(ZERO_ADDRESS, []);
            await expect(gatekeeperNetworkContract.connect(primaryAuthority).updateNetwork(0, updatedNetwork, {gasLimit: 300000})).to.be.rejectedWith("Primary authority cannot be set to the zero address");
        });
        it('cannot update the pass expire time if not primary authority', async () => {
            const updatedNetwork = getDefaultNetwork(alice.address, [], 400);
            await expect(gatekeeperNetworkContract.connect(alice).updateNetwork(1, updatedNetwork, {gasLimit: 300000})).to.be.rejectedWith("Only the primary authority can perform this action");
        });
        it('cannot update supported tokens if not primary authority', async () => {
            const updatedNetwork = getDefaultNetwork(alice.address);
            updatedNetwork.supportedTokens = [stableCoin.address];
            await expect(gatekeeperNetworkContract.connect(alice).updateNetwork(3, updatedNetwork, {gasLimit: 300000})).to.be.rejectedWith("Only the primary authority can perform this action");
        });
        it('cannot update gatekeepers if not primary authority', async () => {
            const updatedNetwork = getDefaultNetwork(alice.address, [alice.address]);
            await expect(gatekeeperNetworkContract.connect(alice).updateNetwork(4, updatedNetwork, {gasLimit: 300000})).to.be.rejectedWith("Only the primary authority can perform this action");
        });

    })

    describe('Gatekeeper Network Deletion', async () => {
        beforeEach('create network', async () => {
            const defaultNetwork = getDefaultNetwork(primaryAuthority.address, []);
            await gatekeeperNetworkContract.connect(deployer).createNetwork(defaultNetwork, {gasLimit: 300000});
        });

        it('can delete a network', async () => {
            //given
            const existingNetwork = getDefaultNetwork(primaryAuthority.address);
            const network = await gatekeeperNetworkContract._networks(existingNetwork.name);
            expect(network.name).to.equal(existingNetwork.name);

            //when
            await gatekeeperNetworkContract.connect(primaryAuthority).closeNetwork(existingNetwork.name);

            //then
            const resolvedNetwork = await gatekeeperNetworkContract._networks(existingNetwork.name);
            expect(resolvedNetwork.primaryAuthority).to.equal(ZERO_ADDRESS);
        });

        it('cannot delete a network that does not exist', async () => {
            await expect(gatekeeperNetworkContract.connect(primaryAuthority).closeNetwork(utils.formatBytes32String('non-real-network'))).to.be.revertedWith("Network does not exist");
        });

        it('cannot delete a network with gatekeepers', async () => {
            // given
            const updatedNetwork = getDefaultNetwork(primaryAuthority.address);
            updatedNetwork.gatekeepers = [bob.address, primaryAuthority.address];

            // Add gatekeepers to network
            await gatekeeperNetworkContract.connect(primaryAuthority).updateNetwork(4, updatedNetwork, {gasLimit: 300000});

            //when
            await expect(gatekeeperNetworkContract.connect(primaryAuthority).closeNetwork(updatedNetwork.name)).to.be.revertedWith("Network can only be removed if no gatekeepers are in it");
        });
    })
})
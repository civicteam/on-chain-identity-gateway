import { ethers, upgrades } from 'hardhat';
import { keccak256 } from '@ethersproject/keccak256';
import { toUtf8Bytes } from '@ethersproject/strings';
import { toBytes32 } from './utils';

import { expect } from 'chai';
import { NULL_CHARGE, randomAddress, randomWallet, ZERO_ADDRESS } from './utils/eth';
import { signMetaTxRequest } from '../../gateway-eth-ts/src/utils/metatx';
import {
  ChargeHandler__factory,
  DummyERC20,
  ERC2771Test,
  FlagsStorage__factory,
  FlexibleNonceForwarder,
  GatewayToken,
  GatewayTokenClientERC2771Test,
  GatewayTokenClientERC2771UpgradeableTest,
  GatewayTokenClientERC2771UpgradeableTest__factory,
  GatewayTokenClientTest,
  GatewayTokenInternalsTest__factory,
  GatewayToken__factory,
  IForwarder,
  IForwarder__factory,
  StubMultisig,
} from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { Contract, ContractTransaction, ContractTransactionReceipt } from 'ethers';

describe('GatewayToken', async () => {
  let identityCom: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let carol: SignerWithAddress;
  let gatekeeper: SignerWithAddress;
  let gatekeeper2: SignerWithAddress;
  let networkAuthority2: SignerWithAddress;

  let forwarder: FlexibleNonceForwarder;
  let flagsStorage: Contract;
  let chargeHandler: Contract;
  let gatewayToken: Contract;
  let gatewayTokenInternalsTest: Contract;

  let gatewayTokenAddress: string;
  let chargeHandlerAddress: string;
  let flagsStorageAddress: string;
  let forwarderAddress: string;
  let gatewayTokenInternalsTestAddress: string;

  let hexRetailFlag = toBytes32('Retail');
  let hexInstitutionFlag = toBytes32('Institution');
  let hexAccreditedInvestorFlag = toBytes32('AccreditedInvestor');

  let gkn1 = 10;
  let gkn2 = 20;
  let daoManagedGkn = 30;

  const expectVerified = (address: string, gkn: number): Chai.PromisedAssertion => {
    const verified = gatewayToken['verifyToken(address,uint256)'](address, gkn);
    return expect(verified).eventually;
  };

  const makeMetaTx = async (tx: ContractTransaction) => {
    const forwarderContract = IForwarder__factory.connect(await forwarder.getAddress(), forwarder.runner);
    return signMetaTxRequest(gatekeeper, forwarderContract, {
      from: gatekeeper.address,
      to: await gatewayToken.getAddress(),
      data: tx.data as string,
      gas: 500_000,
    });
  };

  const makeWeiCharge = (value: bigint) => ({
    token: ZERO_ADDRESS,
    chargeType: 1,
    value,
    recipient: gatekeeper.address,
    tokenSender: ZERO_ADDRESS,
  });

  const makeERC20Charge = (value: bigint, token: string, tokenSender: string) => ({
    token,
    chargeType: 2,
    value,
    recipient: gatekeeper.address,
    tokenSender,
  });

  const gatewayTokenFor = (signer: SignerWithAddress) => GatewayToken__factory.connect(gatewayTokenAddress, signer);
  const flagsStorageFor = (signer: SignerWithAddress) => FlagsStorage__factory.connect(flagsStorageAddress, signer);
  const gatewayTokenInternalsTestFor = (signer: SignerWithAddress) =>
    GatewayTokenInternalsTest__factory.connect(gatewayTokenInternalsTestAddress, signer);
  const chargeHandlerFor = (signer: SignerWithAddress) => ChargeHandler__factory.connect(chargeHandlerAddress, signer);

  before('deploy contracts', async () => {
    [identityCom, alice, bob, carol, gatekeeper, gatekeeper2, networkAuthority2] = await ethers.getSigners();

    const forwarderFactory = await ethers.getContractFactory('FlexibleNonceForwarder');
    const flagsStorageFactory = await ethers.getContractFactory('FlagsStorage');
    const chargeHandlerFactory = await ethers.getContractFactory('ChargeHandler');
    const gatewayTokenFactory = await ethers.getContractFactory('GatewayToken');
    const gatewayTokenInternalsTestFactory = await ethers.getContractFactory('GatewayTokenInternalsTest');

    forwarder = await forwarderFactory.deploy(100);
    await forwarder.waitForDeployment();

    flagsStorage = await upgrades.deployProxy(flagsStorageFactory, [identityCom.address], { kind: 'uups' });
    await flagsStorage.waitForDeployment();

    chargeHandler = await upgrades.deployProxy(chargeHandlerFactory, [identityCom.address], { kind: 'uups' });
    await chargeHandler.waitForDeployment();

    chargeHandlerAddress = await chargeHandler.getAddress();
    forwarderAddress = await forwarder.getAddress();
    flagsStorageAddress = await flagsStorage.getAddress();

    const args = [
      'Gateway Protocol',
      'GWY',
      identityCom.address,
      flagsStorageAddress,
      chargeHandlerAddress,
      [await forwarder.getAddress()],
    ];
    gatewayToken = await upgrades.deployProxy(gatewayTokenFactory, args, { kind: 'uups' });
    await gatewayToken.waitForDeployment();

    gatewayTokenAddress = await gatewayToken.getAddress();

    // set the gateway token contract as the owner of the chargeHandler
    const chargeHandlerContract = await ethers.getContractAt('ChargeHandler', chargeHandlerAddress);
    await chargeHandlerContract.setRole(keccak256(toUtf8Bytes('CHARGE_CALLER_ROLE')), gatewayTokenAddress);

    // Use the internal test contract to test internal functions
    gatewayTokenInternalsTest = await upgrades.deployProxy(gatewayTokenInternalsTestFactory, args, { kind: 'uups' });
    await gatewayTokenInternalsTest.waitForDeployment();
    gatewayTokenInternalsTestAddress = await gatewayTokenInternalsTest.getAddress();

    // create gatekeeper networks
    await gatewayTokenFor(identityCom).createNetwork(gkn1, 'Test GKN 1', false, ZERO_ADDRESS);
    await gatewayTokenFor(identityCom).createNetwork(gkn2, 'Test GKN 2', false, ZERO_ADDRESS);
  });

  describe('Deployment Tests', async () => {
    describe('gatewayToken', async () => {
      it('emits an event on deployment', async () => {
        const gatewayTokenFactory = await ethers.getContractFactory('GatewayToken');

        const args = [
          'Gateway Protocol2',
          'GWY2',
          identityCom.address,
          flagsStorageAddress,
          chargeHandlerAddress,
          [forwarderAddress],
        ];

        const contract = await upgrades.deployProxy(gatewayTokenFactory, args, { kind: 'uups' });

        // check the events emitted by deploying the contract
        // we use this method (parsing the logs) rather than the hardhat chai matcher `.to.emit()`
        // because upgrades.deployProxy does not return a transaction.
        const receipt = await contract.deploymentTransaction()?.wait();
        const parsedLogs = receipt?.logs.map((log) => contract.interface.parseLog(log));
        expect(parsedLogs?.map((l) => l?.name)).to.include('GatewayTokenInitialized');
      });

      it('fails deployment with a NULL ADDRESS for the superAdmin', async () => {
        const gatewayTokenFactory = await ethers.getContractFactory('GatewayToken');

        const args = [
          'Gateway Protocol',
          'GWY',
          ZERO_ADDRESS,
          flagsStorageAddress,
          chargeHandlerAddress,
          [forwarderAddress],
        ];
        await expect(upgrades.deployProxy(gatewayTokenFactory, args, { kind: 'uups' })).to.be.revertedWithCustomError(
          gatewayToken,
          'Common__MissingAccount',
        );
      });

      it('fails deployment with a NULL ADDRESS for the flagsStorage', async () => {
        const gatewayTokenFactory = await ethers.getContractFactory('GatewayToken');

        const args = [
          'Gateway Protocol',
          'GWY',
          identityCom.address,
          ZERO_ADDRESS,
          chargeHandlerAddress,
          [forwarderAddress],
        ];
        await expect(upgrades.deployProxy(gatewayTokenFactory, args, { kind: 'uups' })).to.be.revertedWithCustomError(
          gatewayToken,
          'Common__MissingAccount',
        );
      });

      it('fails deployment with a NULL ADDRESS for the chargeHandler', async () => {
        const gatewayTokenFactory = await ethers.getContractFactory('GatewayToken');

        const args = [
          'Gateway Protocol',
          'GWY',
          identityCom.address,
          flagsStorageAddress,
          ZERO_ADDRESS,
          [forwarderAddress],
        ];
        await expect(upgrades.deployProxy(gatewayTokenFactory, args, { kind: 'uups' })).to.be.revertedWithCustomError(
          gatewayToken,
          'Common__MissingAccount',
        );
      });

      it('fails deployment with a NULL ADDRESS in the trusted forwarder array', async () => {
        const gatewayTokenFactory = await ethers.getContractFactory('GatewayToken');

        const args = [
          'Gateway Protocol',
          'GWY',
          identityCom.address,
          flagsStorageAddress,
          chargeHandlerAddress,
          [forwarderAddress, ZERO_ADDRESS],
        ];
        await expect(upgrades.deployProxy(gatewayTokenFactory, args, { kind: 'uups' })).to.be.revertedWithCustomError(
          gatewayToken,
          'Common__MissingAccount',
        );
      });

      it('cannot call initialize after deployment', async () => {
        await expect(
          gatewayToken.initialize(
            'Gateway Protocol',
            'GWY',
            identityCom.address,
            flagsStorageAddress,
            chargeHandlerAddress,
            [forwarderAddress],
          ),
        ).to.be.revertedWith(/Initializable: contract is already initialized/);
      });
    });

    describe('flagsStorage', async () => {
      it('cannot call initialize after deployment', async () => {
        await expect(flagsStorage.initialize(identityCom.address)).to.be.revertedWith(
          /Initializable: contract is already initialized/,
        );
      });

      it('cannot call initialize with a null superAdmin', async () => {
        const flagsStorageFactory = await ethers.getContractFactory('FlagsStorage');
        await expect(
          upgrades.deployProxy(flagsStorageFactory, [ZERO_ADDRESS], { kind: 'uups' }),
        ).to.be.revertedWithCustomError(flagsStorage, 'Common__MissingAccount');
      });
    });

    describe('chargeHandler', async () => {
      it('fails deployment with a NULL ADDRESS for the owner', async () => {
        const chargeHandlerFactory = await ethers.getContractFactory('ChargeHandler');
        await expect(
          upgrades.deployProxy(chargeHandlerFactory, [ZERO_ADDRESS], { kind: 'uups' }),
        ).to.be.revertedWithCustomError(chargeHandler, 'Common__MissingAccount');
      });
    });
  });

  describe('Gatekeeper Networks', async () => {
    it('Get gatekeeper network by id', async () => {
      let network = await gatewayToken.getNetwork(gkn1);
      expect(network).to.equal('Test GKN 1');
    });

    it('rename gatekeeper network - reverts if unauthorized', async () => {
      await expect(gatewayTokenFor(alice).renameNetwork(gkn1, 'Test GKN 1 Renamed')).to.be.revertedWithCustomError(
        gatewayToken,
        'Common__Unauthorized',
      );
    });

    it('rename gatekeeper network - reverts if network does not exist', async () => {
      await expect(gatewayTokenFor(alice).renameNetwork(11111, 'Test GKN 1 Renamed')).to.be.revertedWithCustomError(
        gatewayToken,
        'GatewayToken__NetworkDoesNotExist',
      );
    });

    it('rename gatekeeper network - reverts if empty', async () => {
      await expect(gatewayTokenFor(identityCom).renameNetwork(gkn1, '')).to.be.revertedWithCustomError(
        gatewayToken,
        'GatewayToken__EmptyNetworkName',
      );
    });

    it('rename gatekeeper network', async () => {
      const newName = 'Test GKN 1 Renamed';
      await gatewayTokenFor(identityCom).renameNetwork(gkn1, newName);
      let network = await gatewayToken.getNetwork(gkn1);
      expect(network).to.equal(newName);
    });

    it('create network - reverts if name is empty', async () => {
      const shouldFail = gatewayTokenFor(identityCom).createNetwork(gkn1, '', false, ZERO_ADDRESS);

      await expect(shouldFail).to.be.revertedWithCustomError(gatewayToken, 'GatewayToken__EmptyNetworkName');
    });
  });

  describe('Test executing functions only for Civic admin by third-party address', async () => {
    it('Try to change admin by Bob, expect revert due to invalid access', async () => {
      await expect(gatewayTokenFor(bob).setSuperAdmin(bob.address)).to.be.revertedWithCustomError(
        gatewayToken,
        'Common__NotSuperAdmin',
      );
    });
  });

  describe('Test FlagsStorage smart contract', async () => {
    it('add flag, revert if not super admin', async () => {
      await expect(flagsStorageFor(bob).addFlag(hexRetailFlag, 0)).to.be.revertedWithCustomError(
        gatewayToken,
        'Common__NotSuperAdmin',
      );
    });

    it('add flag by superadmin, expect success', async () => {
      await flagsStorageFor(identityCom).addFlag(hexRetailFlag, 0);
    });

    it('add several flags, revert if not super admin', async () => {
      let flagCodes = [hexInstitutionFlag, hexAccreditedInvestorFlag];
      let indexArray = [1, 2];

      await expect(flagsStorageFor(bob).addFlags(flagCodes, indexArray)).to.be.revertedWithCustomError(
        flagsStorage,
        'Common__NotSuperAdmin',
      );
    });

    it('add several flags, index array wrong length, revert', async () => {
      let flagCodes = [hexInstitutionFlag, hexAccreditedInvestorFlag];
      let indexArrayTooSmall = [1];

      await expect(flagsStorageFor(identityCom).addFlags(flagCodes, indexArrayTooSmall)).to.be.revertedWithCustomError(
        flagsStorage,
        'FlagsStorage__IncorrectVariableLength',
      );
    });

    it('add several flags by superadmin, expect success', async () => {
      let flagCodes = [hexInstitutionFlag, hexAccreditedInvestorFlag];
      let indexArray = [1, 2];

      await flagsStorageFor(identityCom).addFlags(flagCodes, indexArray);
    });

    it('add new flag at already used index - revert', async () => {
      await expect(flagsStorage.addFlag(hexRetailFlag, 3)).to.be.revertedWithCustomError(
        flagsStorage,
        'FlagsStorage__FlagAlreadyExists',
      );
    });

    it('add existing flag - revert', async () => {
      await expect(flagsStorage.addFlag(hexRetailFlag, 0)).to.be.revertedWithCustomError(
        flagsStorage,
        'FlagsStorage__IndexAlreadyUsed',
      );
    });

    it('remove flag, revert if not superAdmin', async () => {
      await expect(flagsStorageFor(bob).removeFlag(hexRetailFlag)).to.be.revertedWithCustomError(
        flagsStorage,
        'Common__NotSuperAdmin',
      );
    });

    it('remove flag, revert if not supported', async () => {
      await expect(flagsStorageFor(identityCom).removeFlag(toBytes32('unknownFlag'))).to.be.revertedWithCustomError(
        flagsStorage,
        'FlagsStorage__FlagNotSupported',
      );
    });

    it('remove flag', async () => {
      const tempFlag = toBytes32('tempFlag');
      await flagsStorageFor(identityCom).addFlag(tempFlag, 3);
      expect(await flagsStorage.isFlagSupported(tempFlag)).to.be.true;

      await flagsStorageFor(identityCom).removeFlag(tempFlag);
      expect(await flagsStorage.isFlagSupported(tempFlag)).to.be.false;
    });

    it('remove flags', async () => {
      const tempFlags = [toBytes32('tempFlag1'), toBytes32('tempFlag2')];
      await flagsStorageFor(identityCom).addFlags(tempFlags, [3, 4]);
      expect(await flagsStorage.isFlagSupported(tempFlags[0])).to.be.true;
      expect(await flagsStorage.isFlagSupported(tempFlags[1])).to.be.true;

      await flagsStorageFor(identityCom).removeFlags(tempFlags);
      expect(await flagsStorage.isFlagSupported(tempFlags[0])).to.be.false;
      expect(await flagsStorage.isFlagSupported(tempFlags[1])).to.be.false;
    });

    it('remove flags - revert if not superAdmin', async () => {
      const tempFlags = [toBytes32('tempFlag1'), toBytes32('tempFlag2')];
      await expect(flagsStorageFor(bob).removeFlags(tempFlags)).to.be.revertedWithCustomError(
        flagsStorage,
        'Common__NotSuperAdmin',
      );
    });

    it('remove flags - revert if flags not present', async () => {
      const tempFlags = [toBytes32('tempFlag1'), toBytes32('tempFlag2')];
      await expect(flagsStorageFor(identityCom).removeFlags(tempFlags)).to.be.revertedWithCustomError(
        flagsStorage,
        'FlagsStorage__FlagNotSupported',
      );
    });

    it('Sets a new flag storage contract - reverts if not authorized', async () => {
      const flagsStorageFactory = await ethers.getContractFactory('FlagsStorage');
      const flagsStorage2 = await upgrades.deployProxy(flagsStorageFactory, [identityCom.address], { kind: 'uups' });
      await flagsStorage2.waitForDeployment();

      await expect(
        gatewayTokenFor(bob).updateFlagsStorage(await flagsStorage2.getAddress()),
      ).to.be.revertedWithCustomError(gatewayToken, 'Common__NotSuperAdmin');
    });

    it('Sets a new flag storage contract - reverts on zero address', async () => {
      const flagsStorageFactory = await ethers.getContractFactory('FlagsStorage');
      const flagsStorage2 = await upgrades.deployProxy(flagsStorageFactory, [identityCom.address], { kind: 'uups' });
      await flagsStorage2.waitForDeployment();

      await expect(gatewayTokenFor(identityCom).updateFlagsStorage(ZERO_ADDRESS)).to.be.revertedWithCustomError(
        gatewayToken,
        'Common__MissingAccount',
      );
    });

    it('sets a new flag storage contract', async () => {
      const flagsStorageFactory = await ethers.getContractFactory('FlagsStorage');
      const flagsStorage2 = await upgrades.deployProxy(flagsStorageFactory, [identityCom.address], { kind: 'uups' });
      await flagsStorage2.waitForDeployment();

      const flagsStorage2Address = await flagsStorage2.getAddress();

      await gatewayToken.updateFlagsStorage(flagsStorage2Address);

      expect(await gatewayToken.flagsStorage()).to.equal(flagsStorage2Address);
    });

    it('updates the flags storage super admin - reverts if not authorized', async () => {
      await expect(flagsStorageFor(bob).updateSuperAdmin(bob.address)).to.be.revertedWithCustomError(
        flagsStorage,
        'Common__NotSuperAdmin',
      );
    });

    it('updates the flags storage super admin - reverts if new superadmin is null address', async () => {
      await expect(flagsStorage.updateSuperAdmin(ZERO_ADDRESS)).to.be.revertedWithCustomError(
        flagsStorage,
        'Common__MissingAccount',
      );
    });

    it('updates the flags storage super admin', async () => {
      // give bob the super admin role
      await flagsStorage.updateSuperAdmin(bob.address);
      expect(await flagsStorage.superAdmin()).to.equal(bob.address);

      // send it back
      await flagsStorageFor(bob).updateSuperAdmin(identityCom.address);
      expect(await flagsStorage.superAdmin()).to.equal(identityCom.address);
    });
  });

  describe('super-admin', async () => {
    it('set and revoke super admin', async () => {
      await gatewayTokenFor(identityCom).setSuperAdmin(alice.address);
      expect(await gatewayToken.isSuperAdmin(alice.address)).to.be.true;

      await gatewayTokenFor(identityCom).revokeSuperAdmin(alice.address);
      expect(await gatewayToken.isSuperAdmin(alice.address)).to.be.false;
    });

    it('a superadmin cannot revoke themselves', async () => {
      await expect(gatewayTokenFor(identityCom).revokeSuperAdmin(identityCom.address)).to.be.revertedWithCustomError(
        gatewayToken,
        'ParameterizedAccessControl__NoSelfAdminRemoval',
      );
    });
  });

  describe('network authorities', async () => {
    it('Successfully add 1 new network authority to gatekeeper network', async () => {
      await gatewayTokenFor(identityCom).addNetworkAuthority(networkAuthority2.address, gkn1);
      expect(await gatewayTokenFor(identityCom).isNetworkAuthority(networkAuthority2.address, gkn1)).to.be.true;
    });

    it('Successfully add a gatekeeper after becoming network authority', async () => {
      await gatewayTokenFor(networkAuthority2).addGatekeeper(gatekeeper.address, gkn1);
    });

    it('Expect revert when attempting to issue as a non-gatekeeper network authority', async () => {
      await expect(
        gatewayTokenFor(networkAuthority2).mint(alice.address, gkn1, 0, 0, NULL_CHARGE),
      ).to.be.revertedWithCustomError(gatewayToken, 'Common__Unauthorized');
    });

    it("Try to remove non-existing network authorities, don't expect revert", async () => {
      await gatewayTokenFor(identityCom).removeNetworkAuthority('0x2F60d06Fa6795365B7b42B27Fa23e3e8c8b82f66', gkn1);
    });

    it('Remove a network authority', async () => {
      await gatewayTokenFor(identityCom).removeNetworkAuthority(networkAuthority2.address, gkn1);
    });

    it('Expect revert on adding new network authority by Alice', async () => {
      await expect(gatewayTokenFor(alice).addNetworkAuthority(bob.address, gkn1)).to.be.revertedWithCustomError(
        gatewayToken,
        'Common__Unauthorized',
      );
    });

    it('Expect revert on removing existing network authority by Alice', async () => {
      await expect(
        gatewayTokenFor(alice).removeNetworkAuthority(identityCom.address, gkn1),
      ).to.be.revertedWithCustomError(gatewayToken, 'Common__Unauthorized');
    });
  });

  describe('RBAC', () => {
    it('renounce role', async () => {
      // add bob as a gatekeeper
      await gatewayTokenFor(identityCom).addGatekeeper(bob.address, gkn1);
      // bob renounces
      await gatewayTokenFor(bob).renounceRole(keccak256(toUtf8Bytes('GATEKEEPER_ROLE')), gkn1, bob.address);
    });
  });

  describe('Test gateway token issuance', async () => {
    it('verified returns false if a token is not yet minted', async () => {
      return expectVerified(alice.address, gkn1).to.be.false;
    });

    it('mint Gateway Token for Alice by gatekeeper with gatekeeperNetwork = 1', async () => {
      await gatewayTokenFor(gatekeeper).mint(alice.address, gkn1, 0, 0, NULL_CHARGE);

      return expectVerified(alice.address, gkn1).to.be.true;
    });

    it('verified returns false if for a different gatekeeper network', async () => {
      return expectVerified(alice.address, gkn2).to.be.false;
    });

    it('retrieves tokenId', async () => {
      const tokenId = await gatewayToken.tokenOfOwnerByIndex(alice.address, 0);
      expect(tokenId).to.equal(1n);
      let tokenOwner = await gatewayToken.ownerOf(1);
      expect(tokenOwner).to.equal(alice.address);
    });

    it('retrieves token by tokenId', async () => {
      const tokenId = await gatewayToken.tokenOfOwnerByIndex(alice.address, 0);
      const token = await gatewayToken.getToken(tokenId);
      expect(token.owner).to.equal(alice.address);
    });

    it('Successfully mint Gateway Token for Alice by gatekeeper with gatekeeperNetwork = 2', async () => {
      // add the gatekeeper to network 2
      await gatewayTokenFor(identityCom).addGatekeeper(gatekeeper.address, gkn2);

      await gatewayTokenFor(gatekeeper).mint(alice.address, gkn2, 0, 0, NULL_CHARGE);

      return expectVerified(alice.address, gkn2).to.be.true;
    });

    it('mint a second token for Alice with gatekeeperNetwork = 1', async () => {
      await gatewayTokenFor(gatekeeper).mint(alice.address, gkn1, 0, 0, NULL_CHARGE);

      return expectVerified(alice.address, gkn2).to.be.true;
    });

    it('get all tokens for a user and network', async () => {
      const aliceTokenIdsGKN1 = await gatewayToken.getTokenIdsByOwnerAndNetwork(alice.address, gkn1, true);
      expect(aliceTokenIdsGKN1.length).to.equal(2);
      expect(await gatewayToken.ownerOf(aliceTokenIdsGKN1[0])).to.equal(alice.address);
      expect(await gatewayToken.ownerOf(aliceTokenIdsGKN1[1])).to.equal(alice.address);
    });

    it('onlyActive should determine whether an expired token is returned or not', async () => {
      const aliceTokenIdsGKN1 = await gatewayToken.getTokenIdsByOwnerAndNetwork(alice.address, gkn1, true);
      const beforeExpiration = await gatewayToken.getExpiration(aliceTokenIdsGKN1[1]);
      await gatewayTokenFor(gatekeeper).setExpiration(
        aliceTokenIdsGKN1[1],
        Date.parse('2020-01-01') / 1000,
        NULL_CHARGE,
      );

      const aliceTokenIdsGKN1AfterExpiry = await gatewayToken.getTokenIdsByOwnerAndNetwork(alice.address, gkn1, true);

      expect(aliceTokenIdsGKN1AfterExpiry.length).to.equal(1);
      expect(await gatewayToken.ownerOf(aliceTokenIdsGKN1AfterExpiry[0])).to.equal(alice.address);

      const aliceTokenIdsGKN1AfterExpiryFlagFalse = await gatewayToken.getTokenIdsByOwnerAndNetwork(
        alice.address,
        gkn1,
        false,
      );
      expect(aliceTokenIdsGKN1AfterExpiryFlagFalse.length).to.equal(2);
      expect(await gatewayToken.ownerOf(aliceTokenIdsGKN1AfterExpiryFlagFalse[0])).to.equal(alice.address);
      expect(await gatewayToken.ownerOf(aliceTokenIdsGKN1AfterExpiryFlagFalse[1])).to.equal(alice.address);

      // reset expiration
      await gatewayTokenFor(gatekeeper).setExpiration(aliceTokenIdsGKN1[1], beforeExpiration, NULL_CHARGE);
    });

    it('Try to transfer a token, expect revert', async () => {
      await expect(
        gatewayTokenFor(alice)['transferFrom(address,address,uint256)'](alice.address, bob.address, 1),
      ).to.be.revertedWith('ERC3525: transfer caller is not owner nor approved');
    });

    it('Try to approve transferring a token, expect revert', async () => {
      await expect(gatewayTokenFor(alice)['approve(address,uint256)'](bob.address, 1)).to.be.revertedWithCustomError(
        gatewayToken,
        'GatewayToken__TransferDisabled',
      );

      await expect(
        gatewayTokenFor(alice)['approve(uint256,address,uint256)'](1, bob.address, 1),
      ).to.be.revertedWithCustomError(gatewayToken, 'GatewayToken__TransferDisabled');
    });

    it('Try to transfer 1st tokenId by Carol while transfers still restricted', async () => {
      await expect(
        gatewayTokenFor(carol)['safeTransferFrom(address,address,uint256)'](alice.address, alice.address, 1),
      ).to.be.revertedWith('ERC3525: transfer caller is not owner nor approved');
    });

    it('Mint a token with a bitmask', async () => {
      const expectedBitmask = 1;
      const dummyWallet = randomAddress();
      await gatewayTokenFor(gatekeeper).mint(dummyWallet, gkn1, 0, expectedBitmask, NULL_CHARGE);

      const [dummyWalletTokenId] = await gatewayToken.getTokenIdsByOwnerAndNetwork(dummyWallet, gkn1, true);
      const bitmask = await gatewayToken.getTokenBitmask(dummyWalletTokenId);

      expect(bitmask).to.equal(expectedBitmask);
    });

    it('Mint a token with an expiration', async () => {
      const dummyWallet = randomAddress();
      const expectedExpiration = Date.parse('2222-01-01') / 1000;
      await gatewayTokenFor(gatekeeper).mint(dummyWallet, gkn1, expectedExpiration, 0, NULL_CHARGE);

      const [dummyWalletTokenId] = await gatewayToken.getTokenIdsByOwnerAndNetwork(dummyWallet, gkn1, true);
      const expiration = await gatewayToken.getExpiration(dummyWalletTokenId);

      expect(expiration).to.equal(expectedExpiration);
    });
  });

  describe('Add and remove Gatekeeper', () => {
    it('can add a gatekeeper', async () => {
      const dummyGatekeeper = randomAddress();
      await gatewayTokenFor(identityCom).addGatekeeper(dummyGatekeeper, gkn1);
      const isGatekeeperResult = await gatewayToken.isGatekeeper(dummyGatekeeper, gkn1);

      expect(isGatekeeperResult).to.be.true;
    });

    it('does not add the gatekeeper to other networks', async () => {
      const dummyGatekeeper = randomAddress();
      await gatewayTokenFor(identityCom).addGatekeeper(dummyGatekeeper, gkn1);
      const isGatekeeperResult = await gatewayToken.isGatekeeper(dummyGatekeeper, gkn2);

      expect(isGatekeeperResult).to.be.false;
    });

    it('can remove a gatekeeper', async () => {
      const dummyGatekeeper = randomAddress();
      await gatewayTokenFor(identityCom).addGatekeeper(dummyGatekeeper, gkn1);
      expect(await gatewayToken.isGatekeeper(dummyGatekeeper, gkn1)).to.be.true;

      await gatewayTokenFor(identityCom).removeGatekeeper(dummyGatekeeper, gkn1);
      expect(await gatewayToken.isGatekeeper(dummyGatekeeper, gkn1)).to.be.false;
    });

    it('removing a gatekeeper does not invalidate existing tokens by default', async () => {
      const passRecipient = randomAddress();
      await gatewayTokenFor(identityCom).addGatekeeper(gatekeeper2.address, gkn1);

      await gatewayTokenFor(gatekeeper2).mint(passRecipient, gkn1, 0, 0, NULL_CHARGE);

      await gatewayTokenFor(identityCom).removeGatekeeper(gatekeeper2.address, gkn1);
      return expectVerified(passRecipient, gkn1).to.be.true;
    });

    it('removing a gatekeeper invalidates existing tokens if the network has the REMOVE_GATEKEEPER_INVALIDATES_TOKENS feature', async () => {
      const passRecipient = randomAddress();
      await gatewayTokenFor(identityCom).addGatekeeper(gatekeeper2.address, gkn2);

      const removeGatekeeperInvalidatesTokensFeature = 0;
      const mask = 1 << removeGatekeeperInvalidatesTokensFeature;

      let b = await gatewayToken.networkHasFeature(gkn2, removeGatekeeperInvalidatesTokensFeature);
      expect(b).to.be.false;

      await gatewayTokenFor(identityCom).setNetworkFeatures(gkn2, mask);

      b = await gatewayToken.networkHasFeature(gkn2, removeGatekeeperInvalidatesTokensFeature);
      expect(b).to.be.true;

      await gatewayTokenFor(gatekeeper2).mint(passRecipient, gkn2, 0, 0, NULL_CHARGE);

      await gatewayTokenFor(identityCom).removeGatekeeper(gatekeeper2.address, gkn2);
      return expectVerified(passRecipient, gkn2).to.be.false;
    });
  });

  describe('Test Gated modifier', async () => {
    let client: GatewayTokenClientTest;

    before(async () => {
      const clientFactory = await ethers.getContractFactory('GatewayTokenClientTest');
      client = await clientFactory.deploy(gatewayTokenAddress, gkn1);
    });

    it('rejects if the contract address is zero', async () => {
      const clientFactory = await ethers.getContractFactory('GatewayTokenClientTest');

      await expect(clientFactory.deploy(ZERO_ADDRESS, gkn1)).to.be.reverted;
    });

    it('approves the user if they have a gateway token', async () => {
      // Alice is verified
      await expect(client.connect(alice).testGated()).to.emit(client, 'Success');
    });

    it('rejects the user if they do not have a gateway token', async () => {
      // Carol is not verified
      await expect(client.connect(carol).testGated()).to.be.revertedWithCustomError(
        client,
        'IsGated__InvalidGatewayToken',
      );
    });

    describe('with ERC2771 clients', () => {
      let erc2771Client: GatewayTokenClientERC2771Test;
      before('deploy client', async () => {
        const erc2771ClientFactory = await ethers.getContractFactory('GatewayTokenClientERC2771Test');
        erc2771Client = await erc2771ClientFactory.deploy(gatewayTokenAddress, gkn1);
      });

      it('rejects if the contract address is zero', async () => {
        const erc2771ClientFactory = await ethers.getContractFactory('GatewayTokenClientERC2771Test');

        await expect(erc2771ClientFactory.deploy(ZERO_ADDRESS, gkn1)).to.be.reverted;
      });

      it('supports ERC2771 clients', async () => {
        // Alice is verified
        await expect(erc2771Client.connect(alice).testGated()).to.emit(erc2771Client, 'Success');
      });

      it('supports ERC2771 clients (negative case)', async () => {
        // Carol is not verified
        await expect(erc2771Client.connect(carol).testGated()).to.be.revertedWithCustomError(
          client,
          'IsGated__InvalidGatewayToken',
        );
      });
    });

    describe('with upgradeable ERC2771 clients', () => {
      let erc2771Client: GatewayTokenClientERC2771UpgradeableTest;
      before('deploy client', async () => {
        const erc2771ClientFactory = await ethers.getContractFactory('GatewayTokenClientERC2771UpgradeableTest');
        const erc2771ClientContract = await upgrades.deployProxy(
          erc2771ClientFactory,
          [gatewayTokenAddress, gkn1, []],
          {
            kind: 'uups',
          },
        );
        await erc2771ClientContract.waitForDeployment();

        erc2771Client = GatewayTokenClientERC2771UpgradeableTest__factory.connect(
          await erc2771ClientContract.getAddress(),
          alice,
        );
      });

      it('rejects if the contract address is zero', async () => {
        const erc2771ClientFactory = await ethers.getContractFactory('GatewayTokenClientERC2771UpgradeableTest');

        await expect(
          upgrades.deployProxy(erc2771ClientFactory, [ZERO_ADDRESS, gkn1, []], {
            kind: 'uups',
          }),
        ).to.be.reverted;
      });

      it('supports Upgradeable ERC2771 clients', async () => {
        // Alice is verified
        await expect(erc2771Client.connect(alice).testGated()).to.emit(erc2771Client, 'Success');
      });

      it('supports Upgradeable ERC2771 clients (negative case)', async () => {
        // Carol is not verified
        await expect(erc2771Client.connect(carol).testGated()).to.be.revertedWithCustomError(
          client,
          'IsGated__InvalidGatewayToken',
        );
      });
      it('cannot call initialize after deployment', async () => {
        await expect(erc2771Client.initialize(gatewayTokenAddress, gkn1, [])).to.be.revertedWith(
          /Initializable: contract is already initialized/,
        );
      });
    });
  });

  describe('Test gateway token operations: freeze, unfreeze, setExpiration, revoke', async () => {
    let dummyWallet: string;
    let dummyWalletTokenId: number;

    beforeEach(async () => {
      dummyWallet = randomAddress();
      await gatewayTokenFor(gatekeeper).mint(dummyWallet, gkn1, 0, 0, NULL_CHARGE);

      [dummyWalletTokenId] = await gatewayToken.getTokenIdsByOwnerAndNetwork(dummyWallet, gkn1, true);
    });

    it('freeze token', async () => {
      await gatewayTokenFor(gatekeeper).freeze(dummyWalletTokenId);

      return expectVerified(dummyWallet, gkn1).to.be.false;
    });

    it('freeze token - revert if already frozen', async () => {
      await gatewayTokenFor(gatekeeper).freeze(dummyWalletTokenId);

      await expect(gatewayTokenFor(gatekeeper).freeze(dummyWalletTokenId)).to.be.revertedWithCustomError(
        gatewayToken,
        'GatewayToken__TokenDoesNotExistOrIsInactive',
      );
    });

    it('unfreeze token', async () => {
      await gatewayTokenFor(gatekeeper).freeze(dummyWalletTokenId);

      await gatewayTokenFor(gatekeeper).unfreeze(dummyWalletTokenId);

      return expectVerified(alice.address, gkn2).to.be.true;
    });

    it('unfreeze token - revert if not frozen', async () => {
      await expect(gatewayTokenFor(gatekeeper).unfreeze(dummyWalletTokenId)).to.be.revertedWithCustomError(
        gatewayToken,
        'GatewayToken__TokenInvalidStateForOperation',
      );
    });

    it('all tokens must be frozen for to verify to return false', async () => {
      // mint a second token
      await gatewayTokenFor(gatekeeper).mint(dummyWallet, gkn1, 0, 0, NULL_CHARGE);
      const dummyWalletTokenIds = await gatewayToken.getTokenIdsByOwnerAndNetwork(alice.address, gkn1, true);

      await gatewayTokenFor(gatekeeper).freeze(dummyWalletTokenIds[0]);

      await expectVerified(alice.address, gkn1).to.be.true;

      await gatewayTokenFor(gatekeeper).freeze(dummyWalletTokenIds[1]);

      await expectVerified(alice.address, gkn1).to.be.false;

      await gatewayTokenFor(gatekeeper).unfreeze(dummyWalletTokenIds[0]);

      return expectVerified(alice.address, gkn1).to.be.true;
    });

    it('expire token', async () => {
      await gatewayTokenFor(gatekeeper).setExpiration(dummyWalletTokenId, Date.parse('2020-01-01') / 1000, NULL_CHARGE);

      const currentExpiration = await gatewayToken.getExpiration(dummyWalletTokenId);
      expect(currentExpiration).to.equal(Date.parse('2020-01-01') / 1000);

      return expectVerified(dummyWallet, gkn1).to.be.false;
    });

    it('extend expiry', async () => {
      await gatewayTokenFor(gatekeeper).setExpiration(dummyWalletTokenId, Date.parse('2222-01-01') / 1000, NULL_CHARGE);

      const currentExpiration = await gatewayToken.getExpiration(dummyWalletTokenId);
      expect(currentExpiration).to.equal(Date.parse('2222-01-01') / 1000);

      return expectVerified(dummyWallet, gkn1).to.be.true;
    });

    it('get expiration - reverts if the token does not exist', async () => {
      await expect(gatewayToken.getExpiration(123456789)).to.be.revertedWithCustomError(
        gatewayToken,
        'GatewayToken__TokenDoesNotExist',
      );
    });

    it('burn', async () => {
      await gatewayTokenFor(gatekeeper).burn(dummyWalletTokenId);
      return expectVerified(dummyWallet, gkn1).to.be.false;
    });

    it('all tokens must be burned for verified to return false', async () => {
      // mint a second token
      await gatewayTokenFor(gatekeeper).mint(dummyWallet, gkn1, 0, 0, NULL_CHARGE);
      const dummyWalletTokenIds = await gatewayToken.getTokenIdsByOwnerAndNetwork(dummyWallet, gkn1, true);

      await gatewayTokenFor(gatekeeper).burn(dummyWalletTokenIds[0]);

      // the wallet still has the other token
      return expectVerified(dummyWallet, gkn1).to.be.true;
    });

    it('revoke a token', async () => {
      await gatewayTokenFor(gatekeeper).revoke(dummyWalletTokenId);
      return expectVerified(dummyWallet, gkn1).to.be.false;
    });

    it('all tokens must be revoked for verified to return false', async () => {
      // mint a second token
      await gatewayTokenFor(gatekeeper).mint(dummyWallet, gkn1, 0, 0, NULL_CHARGE);
      const dummyWalletTokenIds = await gatewayToken.getTokenIdsByOwnerAndNetwork(dummyWallet, gkn1, true);

      await gatewayTokenFor(gatekeeper).revoke(dummyWalletTokenIds[0]);

      const validity = await gatewayTokenFor(gatekeeper)['verifyToken(uint256)'](dummyWalletTokenIds[0]);
      expect(validity).to.equal(false);

      // the wallet still has the other token
      return expectVerified(dummyWallet, gkn1).to.be.true;
    });
  });

  describe('Bitmask operations', async () => {
    let tokenId;

    before(async () => {
      [tokenId] = await gatewayTokenFor(gatekeeper).getTokenIdsByOwnerAndNetwork(alice.address, gkn1, true);
    });

    it('Test bitmask operations for Alice token', async () => {
      const asGatekeeper = gatewayTokenFor(gatekeeper);

      let bitmask = await asGatekeeper.getTokenBitmask(tokenId);
      expect(bitmask.toString(2)).to.equal('0');

      await asGatekeeper.setBitmask(tokenId, 3);

      bitmask = await asGatekeeper.getTokenBitmask(tokenId);
      expect(bitmask.toString(2)).to.equal('11');

      await asGatekeeper.setBitmask(tokenId, 0);

      bitmask = await asGatekeeper.getTokenBitmask(tokenId);
      expect(bitmask.toString(2)).to.equal('0');
    });
  });

  describe('Test gateway token forwarder functions', async () => {
    it('Checks a forwarder exists', async () => {
      expect(await gatewayToken.isTrustedForwarder(forwarderAddress)).to.equal(true);
    });
    it('add a forwarder', async () => {
      const newForwarder = randomAddress();
      await expect(gatewayTokenFor(identityCom).addForwarder(newForwarder)).to.emit(gatewayToken, 'ForwarderAdded');

      expect(await gatewayToken.isTrustedForwarder(newForwarder)).to.equal(true);
    });

    it('add a forwarder - reverts if not superadmin', async () => {
      const newForwarder = randomAddress();

      await expect(gatewayTokenFor(alice).addForwarder(newForwarder)).to.be.revertedWithCustomError(
        gatewayToken,
        'Common__NotSuperAdmin',
      );
    });

    it('remove a forwarder', async () => {
      const newForwarder = randomAddress();
      await gatewayTokenFor(identityCom).addForwarder(newForwarder);
      expect(await gatewayToken.isTrustedForwarder(newForwarder)).to.equal(true);

      await expect(gatewayTokenFor(identityCom).removeForwarder(newForwarder)).to.emit(
        gatewayToken,
        'ForwarderRemoved',
      );
      expect(await gatewayToken.isTrustedForwarder(newForwarder)).to.equal(false);
    });

    it('remove a forwarder - reverts if not superadmin', async () => {
      const newForwarder = randomAddress();
      await gatewayTokenFor(identityCom).addForwarder(newForwarder);

      await expect(gatewayTokenFor(alice).removeForwarder(newForwarder)).to.be.revertedWithCustomError(
        gatewayToken,
        'Common__NotSuperAdmin',
      );
    });

    it('forward a call', async () => {
      const mintTx = await gatewayTokenFor(gatekeeper).mint.populateTransaction(carol.address, gkn1, 0, 0, NULL_CHARGE);

      // Carol does not have the GT yet, because the tx has not been sent
      await expectVerified(carol.address, gkn1).to.be.false;

      const input = {
        from: gatekeeper.address,
        to: gatewayTokenAddress,
        data: mintTx.data as string,
        gas: 500_000,
      };
      const { request, signature } = await signMetaTxRequest(gatekeeper, forwarder as IForwarder, input);

      // send the forwarded transaction
      const forwarderTx = await forwarder.connect(alice).execute(request, signature, { gasLimit: 1000000 });
      const receipt = await forwarderTx.wait();
      expect(receipt?.status).to.equal(1);

      // carol now has the GT
      await expectVerified(carol.address, gkn1).to.be.true;
    });

    it('forward a call - revert if the signer is not the from address', async () => {
      const mintTx = await gatewayTokenFor(gatekeeper).mint.populateTransaction(
        randomAddress(),
        gkn1,
        0,
        0,
        NULL_CHARGE,
      );

      const input = {
        from: gatekeeper.address,
        to: gatewayTokenAddress,
        data: mintTx.data as string,
        gas: 500_000,
      };
      const { request, signature } = await signMetaTxRequest(
        bob, // bob is not the gatekeeper
        forwarder as IForwarder,
        input,
      );

      // send the forwarded transaction
      await expect(
        forwarder.connect(alice).execute(request, signature, { gasLimit: 1000000 }),
      ).to.be.revertedWithCustomError(forwarder, 'FlexibleNonceForwarder__InvalidSigner');
    });

    it('protects against reentrancy', async () => {
      // we are going to create a Gateway transaction,
      // then wrap it twice in a forwarder meta-transaction
      // this should fail.
      // although this particular case is harmless, re-entrancy is
      // dangerous in general and this ensures we protect against it.
      const wallet = randomWallet();
      const mintTx = await gatewayTokenFor(gatekeeper).mint.populateTransaction(
        wallet.address,
        gkn1,
        0,
        0,
        NULL_CHARGE,
      );

      const input1 = {
        from: gatekeeper.address,
        to: gatewayTokenAddress,
        data: mintTx.data as string,
        gas: 500_000,
      };
      const { request: request1, signature: signature1 } = await signMetaTxRequest(
        gatekeeper,
        forwarder as IForwarder,
        input1,
      );

      const forwarderTx1 = await forwarder
        .connect(alice)
        .execute.populateTransaction(request1, signature1, { gasLimit: 1000000 });
      const input2 = {
        from: alice.address,
        to: forwarderAddress,
        data: forwarderTx1.data as string,
        gas: 500_000,
      };
      const { request: request2, signature: signature2 } = await signMetaTxRequest(
        alice,
        forwarder as IForwarder,
        input2,
      );

      // attempt to send the forwarded transaction
      await expect(forwarder.connect(alice).execute(request2, signature2, { gasLimit: 1000000 })).to.be.revertedWith(
        /ReentrancyGuard: reentrant call/,
      );

      await expectVerified(wallet.address, gkn1).to.be.false;
    });

    // The forwarder allows two transactions to be sent with the same nonce, as long as they are different
    // this is important for relayer support
    it('Forwards transactions out of sync', async () => {
      // create two transactions, that share the same forwarder nonce
      const tx1 = await gatewayTokenFor(gatekeeper).mint.populateTransaction(randomAddress(), gkn1, 0, 0, NULL_CHARGE);
      const tx2 = await gatewayTokenFor(gatekeeper).mint.populateTransaction(randomAddress(), gkn1, 0, 0, NULL_CHARGE);

      const req1 = await makeMetaTx(tx1);
      const req2 = await makeMetaTx(tx2);

      const forwarderTx2 = await forwarder.connect(alice).execute(req2.request, req2.signature, { gasLimit: 1000000 });
      const receipt2 = await forwarderTx2.wait();
      expect(receipt2?.status).to.equal(1);

      const forwarderTx1 = await forwarder.connect(alice).execute(req1.request, req1.signature, { gasLimit: 1000000 });
      const receipt1 = await forwarderTx1.wait();
      expect(receipt1?.status).to.equal(1);
    });

    // Transactions cannot be replayed. This is important if "out-of-sync" sending is enabled.
    it('Protects against replay attacks', async () => {
      const userToBeFrozen = randomWallet();
      // mint and freeze a user's token
      await gatewayTokenFor(gatekeeper).mint(userToBeFrozen.address, gkn1, 0, 0, NULL_CHARGE);
      const [tokenId] = await gatewayToken.getTokenIdsByOwnerAndNetwork(userToBeFrozen.address, gkn1, true);
      await gatewayTokenFor(gatekeeper).freeze(tokenId);
      await expectVerified(userToBeFrozen.address, gkn1).to.be.false;

      // create a forwarded metatx to unfreeze the user
      const unfreezeTx = await gatewayTokenFor(gatekeeper).unfreeze.populateTransaction(tokenId);
      const forwardedUnfreezeTx = await makeMetaTx(unfreezeTx);

      // unfreeze the user, then freeze them again
      await (
        await forwarder
          .connect(alice)
          .execute(forwardedUnfreezeTx.request, forwardedUnfreezeTx.signature, { gasLimit: 1000000 })
      ).wait;
      await gatewayTokenFor(gatekeeper).freeze(tokenId);
      await expectVerified(userToBeFrozen.address, gkn1).to.be.false;

      // cannot replay the unfreeze transaction
      const shouldFail = forwarder
        .connect(alice)
        .execute(forwardedUnfreezeTx.request, forwardedUnfreezeTx.signature, { gasLimit: 1000000 });
      // const shouldFail = attemptedReplayTransactionResponse.wait();
      // expect(attemptedReplayTransactionReceipt.status).to.equal(0);
      await expect(shouldFail).to.be.revertedWithCustomError(forwarder, 'FlexibleNonceForwarder__TxAlreadySeen');
      await expectVerified(userToBeFrozen.address, gkn1).to.be.false;
    });

    it('Rejects old transactions', async () => {
      const forwarderFactory = await ethers.getContractFactory('FlexibleNonceForwarder');
      // this forwarder only accepts transactions whose nonces have been seen in this block
      const intolerantForwarder = await forwarderFactory.deploy(0);
      await intolerantForwarder.waitForDeployment();

      await gatewayToken.addForwarder(await intolerantForwarder.getAddress());

      // create two transactions,
      const tx1 = await gatewayTokenFor(gatekeeper).mint.populateTransaction(randomAddress(), gkn1, 0, 0, NULL_CHARGE);
      const tx2 = await gatewayTokenFor(gatekeeper).mint.populateTransaction(randomAddress(), gkn1, 0, 0, NULL_CHARGE);
      const req1 = await signMetaTxRequest(gatekeeper, intolerantForwarder as IForwarder, {
        from: gatekeeper.address,
        to: gatewayTokenAddress,
        data: tx1.data as string,
        gas: 500_000,
      });
      const req2 = await signMetaTxRequest(gatekeeper, intolerantForwarder as IForwarder, {
        from: gatekeeper.address,
        to: gatewayTokenAddress,
        data: tx2.data as string,
        gas: 500_000,
      });

      // send one now (claiming the nonce) and try to send the next one
      // after a block has passed (executing a tx mines a block on hardhat)
      await intolerantForwarder.connect(alice).execute(req1.request, req1.signature, { gasLimit: 1000000 });

      const shouldFail = intolerantForwarder
        .connect(alice)
        .execute(req2.request, req2.signature, { gasLimit: 1000000 });
      await expect(shouldFail).to.be.revertedWithCustomError(forwarder, 'FlexibleNonceForwarder__TxTooOld');
    });

    it('Refunds excess Eth sent with a transaction', async () => {
      const tx = await gatewayTokenFor(gatekeeper).mint.populateTransaction(randomAddress(), gkn1, 0, 0, NULL_CHARGE);
      const req = await makeMetaTx(tx);

      const valueInForwardedTransaction = ethers.parseUnits('1', 'ether');
      const gasPrice = ethers.parseUnits('1', 'gwei');

      const initialBalance = await alice.provider.getBalance(alice.address);
      const forwarderTx = await forwarder
        .connect(alice)
        .execute(req.request, req.signature, { gasPrice, gasLimit: 1_000_000, value: valueInForwardedTransaction });
      const receipt = await forwarderTx.wait();
      const finalBalance = await alice.provider.getBalance(alice.address);

      // the balance should be reduced by just the gas used. The valueInForwardedTransaction should be refunded
      console.log('gas used', receipt?.gasUsed.toString());
      expect(finalBalance).to.equal(initialBalance - (receipt?.gasUsed ?? 0n) * gasPrice);
    });

    it('exposes the correct message data when forwarding a transaction', async () => {
      await expect(gatewayTokenInternalsTest.getMsgData(1)).to.emit(gatewayTokenInternalsTest, 'MsgData');

      const txIndirect = await gatewayTokenInternalsTestFor(gatekeeper).getMsgData.populateTransaction(1);

      const req = await signMetaTxRequest(gatekeeper, forwarder as IForwarder, {
        from: gatekeeper.address,
        // specify the internals test contract here instead of gatewayToken
        to: await gatewayTokenInternalsTest.getAddress(),
        data: txIndirect.data as string,
        gas: 500_000,
      });
      await expect(forwarder.connect(alice).execute(req.request, req.signature)).to.emit(
        gatewayTokenInternalsTest,
        'MsgData',
      );
    });

    it('Exposes the correct message sender when forwarding a transaction (upgradeable version)', async () => {
      await expect(gatewayTokenInternalsTestFor(gatekeeper).getMsgSender())
        .to.emit(gatewayTokenInternalsTest, 'MsgSender')
        .withArgs(gatekeeper.address);

      const txIndirect = await gatewayTokenInternalsTestFor(gatekeeper).getMsgSender.populateTransaction();

      const req = await signMetaTxRequest(gatekeeper, forwarder as IForwarder, {
        from: gatekeeper.address,
        // specify the internals test contract here instead of gatewayToken
        to: await gatewayTokenInternalsTest.getAddress(),
        data: txIndirect.data as string,
        gas: 500_000,
      });
      await expect(forwarder.connect(alice).execute(req.request, req.signature))
        .to.emit(gatewayTokenInternalsTest, 'MsgSender')
        .withArgs(gatekeeper.address);
    });

    // forwarding reserves 1/64rd of the gas for the forwarder to use. If the gas limit is less than that,
    // it reverts.
    it('reverts if the gas limit is less than 1/64rd more than the target transaction', async () => {
      // create two transactions, that share the same forwarder nonce
      const tx1 = await gatewayTokenFor(gatekeeper).mint.populateTransaction(randomAddress(), gkn1, 0, 0, NULL_CHARGE);
      const req1 = await makeMetaTx(tx1);
      // we pass 2,000,000 gas limit to the inner tx (see makeMetaTx)
      // The forwarder reserves 1/64th of that
      const gas = req1.request.gas;
      const reservedGas = Math.ceil(Number(gas.toString()) / 64);

      // 280000 is what is reported by the evm as needed by the mint tx.
      // if we add `reservedGas` to that, and set that as the gas limit, it should work
      // otherwise it will revert
      // expect to have to change this if any of the parameters of the tx change, or if the contract chagnes
      const requiredGas = 280000;
      const gasLimit = requiredGas + reservedGas; // - 10; // less than the required
      await expect(forwarder.connect(alice).execute(req1.request, req1.signature, { gasLimit })).to.be.reverted;
    });

    it('Authorizes an upgrade via a forwarder', async () => {
      // identityCom can authorize an upgrade
      await expect(gatewayTokenInternalsTestFor(identityCom).authorizedUpgrade()).to.emit(
        gatewayTokenInternalsTest,
        'AuthorizedUpgrade',
      );

      // gatekeeper cannot authorize an upgrade
      await expect(gatewayTokenInternalsTestFor(gatekeeper).authorizedUpgrade()).to.be.revertedWithCustomError(
        gatewayTokenInternalsTest,
        'Common__NotSuperAdmin',
      );

      // identityCom can authorize an upgrade (forwarded via Alice)
      const txIndirect = await gatewayTokenInternalsTestFor(identityCom).authorizedUpgrade.populateTransaction();
      const req = await signMetaTxRequest(identityCom, forwarder as IForwarder, {
        from: identityCom.address,
        // specify the internals test contract here instead of gatewayToken
        to: await gatewayTokenInternalsTest.getAddress(),
        data: txIndirect.data as string,
        gas: 500_000,
      });
      await expect(forwarder.connect(alice).execute(req.request, req.signature)).to.emit(
        gatewayTokenInternalsTest,
        'AuthorizedUpgrade',
      );
    });

    describe('using MultiERC2771Context (non-upgradeable version)', () => {
      let erc2771Test: ERC2771Test;

      // the msgData includes the function code (getMsgData) followed by the packed arguments
      // we have only one argument, and it's a uint8. So we just check that that is equal to 1.
      const matchesExpectedMsgData =
        (expectedValue: number) =>
        (eventArg: any): boolean => {
          const bytes = Array.from(Buffer.from(eventArg.replace('0x', ''), 'hex'));
          const lastByte = bytes[bytes.length - 1];
          return lastByte === expectedValue;
        };

      // msgData, when a function is called without any arguments,
      // should be 4 bytes long (the function name hash only)
      const hasFourBytes = (msgData: string) => {
        const bytes = Array.from(Buffer.from(msgData.replace('0x', ''), 'hex'));
        return bytes.length === 4;
      };

      before('set up erc2771 test contract', async () => {
        const ERC2771TestFactory = await ethers.getContractFactory('ERC2771Test');
        erc2771Test = await ERC2771TestFactory.deploy([forwarderAddress]);
      });

      it('remove a forwarder', async () => {
        const newForwarder = randomAddress();
        await erc2771Test.connect(identityCom).addForwarder(newForwarder);
        expect(await erc2771Test.isTrustedForwarder(newForwarder)).to.equal(true);

        await erc2771Test.connect(identityCom).removeForwarder(newForwarder);
        expect(await erc2771Test.isTrustedForwarder(newForwarder)).to.equal(false);
      });

      it('Exposes the correct message sender', async () => {
        const txIndirect = await erc2771Test.connect(gatekeeper).getMsgSender.populateTransaction();

        const req = await signMetaTxRequest(gatekeeper, forwarder as IForwarder, {
          from: gatekeeper.address,
          to: await erc2771Test.getAddress(),
          data: txIndirect.data as string,
          gas: 500_000,
        });
        await expect(forwarder.connect(alice).execute(req.request, req.signature))
          .to.emit(erc2771Test, 'MsgSender')
          .withArgs(gatekeeper.address);
      });

      it('Exposes the correct message data', async () => {
        const txIndirect = await erc2771Test.connect(gatekeeper).getMsgDataWithArg.populateTransaction(1);

        const req = await signMetaTxRequest(gatekeeper, forwarder as IForwarder, {
          from: gatekeeper.address,
          to: await erc2771Test.getAddress(),
          data: txIndirect.data as string,
          gas: 500_000,
        });
        // the msgData includes the function code (getMsgData) followed by the packed arguments
        // we have only one argument, and it's a uint8. So we just check that that is equal to 1.
        await expect(forwarder.connect(alice).execute(req.request, req.signature))
          .to.emit(erc2771Test, 'MsgData')
          .withArgs(matchesExpectedMsgData(1));
      });

      // weird edge case but this is supported - required for ERC2771-compliance
      it('MultiERC2771Context works if the trusted forwarder is not an ERC2771 contract (as long as msg.data is small)', async () => {
        // Deploy an instance of ERC2771 - this is a direct contract (no proxy).
        // Add the gatekeeper as a trusted forwarder (weird because it isn't one).
        // send a message with a small msg.data (no parameters and not a proxy).
        // the msg.sender should be the gatekeeper.
        // This works because we check the size of the msg.data as well as the trusted forwarder
        // if the msg.data is >20, this would return garbage, as it can't tell the difference between
        // a message from an ERC2771 forwarder and a normal message.
        const ERC2771TestFactory = await ethers.getContractFactory('ERC2771Test');
        const erc2771Test = await ERC2771TestFactory.deploy([]);

        // add the gatekeeper as a trusted forwarder
        await erc2771Test.connect(identityCom).addForwarder(gatekeeper.address);

        // calls via the gatekeeper still return the correct sender and data even though
        // the gatekeeper is a trusted forwarder and expected therefore to send the original
        // message sender as part of the call data
        await expect(erc2771Test.connect(gatekeeper).getMsgSender())
          .to.emit(erc2771Test, 'MsgSender')
          .withArgs(gatekeeper.address);

        // If we call a function with no arguments, the resultant msgData will just be the function hash
        // (MultiERC2771Context will pass it through and will not try to strip the last 20 bytes)
        // If the function has *any arguments* then MultiERC2771Context cannot tell the difference
        // between a forwarded function and one called directly from the trusted forwarder
        // and will therefore assume it is forwarded because it is coming from a trusted forwarder.
        await expect(erc2771Test.connect(gatekeeper).getMsgData())
          .to.emit(erc2771Test, 'MsgData')
          .withArgs(hasFourBytes);
      });
    });
  });

  describe('DAO Management', () => {
    let multisigWallet1: StubMultisig;
    let multisigWallet2: StubMultisig;

    let multisigWallet1Address: string;
    let multisigWallet2Address: string;

    before('deploy multisig wallets', async () => {
      const stubMultisigWalletFactory = await ethers.getContractFactory('StubMultisig');
      multisigWallet1 = await stubMultisigWalletFactory.deploy(gatewayTokenAddress, daoManagedGkn);
      multisigWallet2 = await stubMultisigWalletFactory.deploy(gatewayTokenAddress, daoManagedGkn);

      multisigWallet1Address = await multisigWallet1.getAddress();
      multisigWallet2Address = await multisigWallet2.getAddress();
    });

    it('create a dao-managed network', async () => {
      await gatewayTokenFor(identityCom).createNetwork(
        daoManagedGkn,
        'DAO-managed GKN',
        true,
        await multisigWallet1.getAddress(),
      );
    });

    it('create a dao-managed network - revert if the network already exists', async () => {
      await expect(
        gatewayTokenFor(identityCom).createNetwork(
          daoManagedGkn,
          'DAO-managed GKN',
          true,
          await multisigWallet1.getAddress(),
        ),
      ).to.be.revertedWithCustomError(gatewayToken, 'GatewayToken__NetworkAlreadyExists');
    });

    it('create a dao-managed network - revert if the dao manager is not a contract', async () => {
      const nonContractAddress = randomAddress();
      await expect(
        gatewayTokenFor(identityCom).createNetwork(12345, 'DAO-managed GKN', true, nonContractAddress),
      ).to.be.revertedWithCustomError(gatewayToken, 'Common__NotContract');
    });

    it('verifies management role', async () => {
      const isMultisig1DaoManager = await gatewayToken.hasRole(
        keccak256(toUtf8Bytes('DAO_MANAGER_ROLE')),
        daoManagedGkn,
        multisigWallet1Address,
      );

      expect(isMultisig1DaoManager).to.be.true;

      const isMultisig2DaoManager = await gatewayToken.hasRole(
        keccak256(toUtf8Bytes('DAO_MANAGER_ROLE')),
        daoManagedGkn,
        multisigWallet2Address,
      );

      expect(isMultisig2DaoManager).to.be.false;
    });

    it('fails to create a dao-managed network with a ZERO_ADDRESS', async () => {
      await expect(
        gatewayTokenFor(identityCom).createNetwork(40, 'AnotherDAO-managed GKN', true, ZERO_ADDRESS),
      ).to.be.revertedWithCustomError(gatewayToken, 'Common__MissingAccount');
    });

    it('transfer DAO management to a new multisig - reverts if not dao-managed', async () => {
      await expect(
        gatewayTokenFor(alice).transferDAOManager(multisigWallet1Address, multisigWallet2Address, gkn1),
      ).to.be.revertedWithCustomError(gatewayToken, 'GatewayToken__NotDAOGoverned');
    });

    it('transfer DAO management to a new multisig - reverts if called directly', async () => {
      await expect(
        gatewayTokenFor(alice).transferDAOManager(multisigWallet1Address, multisigWallet2Address, daoManagedGkn),
      ).to.be.revertedWithCustomError(gatewayToken, 'Common__Unauthorized');
    });

    it('transfer DAO management to a new multisig - reverts if the new manager is missing', async () => {
      await expect(
        gatewayTokenFor(alice).transferDAOManager(multisigWallet1Address, ZERO_ADDRESS, daoManagedGkn),
      ).to.be.revertedWithCustomError(gatewayToken, 'Common__MissingAccount');
    });

    it('transfer DAO management - reverts if the new manager is not a contract', async () => {
      await expect(
        gatewayTokenFor(alice).transferDAOManager(multisigWallet1Address, bob.address, daoManagedGkn),
      ).to.be.revertedWithCustomError(gatewayToken, 'Common__NotContract');
    });

    it('transfers DAO management to a new multisig', async () => {
      // Note, the multisig wallet (using a stub here) is responsible for authorising the caller.
      // since we are using a stub, anyone can call it here.
      await (await multisigWallet1.connect(alice).reassignOwnership(multisigWallet2Address)).wait();
    });
  });

  describe('Internals', () => {
    const INTERFACE_ID_IERC165 = '0x01ffc9a7';
    const INTERFACE_ID_IERC3525 = '0xd5358140';
    const INTERFACE_ID_IERC721 = '0x80ac58cd';
    const INTERFACE_ID_IERC3525MetadataUpgradeable = '0xe1600902';
    const INTERFACE_ID_ERC20 = '0x36372b07';
    const INTERFACE_ID_IParameterizedAccessControl = '0x6796e9ea';

    it('supports the ERC165 interface', async () => {
      const supportsErc721 = await gatewayToken.supportsInterface(INTERFACE_ID_IERC721);
      const supportsErc3525 = await gatewayToken.supportsInterface(INTERFACE_ID_IERC3525);
      const supportsErc3525MetadataUpgradeable = await gatewayToken.supportsInterface(
        INTERFACE_ID_IERC3525MetadataUpgradeable,
      );
      const supportsParameterizedAccessControl = await gatewayToken.supportsInterface(
        INTERFACE_ID_IParameterizedAccessControl,
      );
      const supportsErc165 = await gatewayToken.supportsInterface(INTERFACE_ID_IERC165);
      // negative case
      const supportsErc20 = await gatewayToken.supportsInterface(INTERFACE_ID_ERC20);

      expect(supportsErc721).to.be.true;
      expect(supportsErc3525).to.be.true;
      expect(supportsErc3525MetadataUpgradeable).to.be.true;
      // via the ParameterizedAccessControl superclass
      expect(supportsParameterizedAccessControl).to.be.true;
      expect(supportsErc165).to.be.true;
      // does not match the ERC20 interface
      expect(supportsErc20).to.be.false;
    });

    it('set a metadata descriptor', async () => {
      const metadataDescriptor = randomAddress();
      await gatewayTokenFor(identityCom).setMetadataDescriptor(metadataDescriptor);
      expect(await gatewayToken.metadataDescriptor()).to.equal(metadataDescriptor);
    });

    it('set a metadata descriptor - revert if not superadmin', async () => {
      const metadataDescriptor = randomAddress();
      await expect(gatewayTokenFor(alice).setMetadataDescriptor(metadataDescriptor)).to.be.revertedWithCustomError(
        gatewayToken,
        'Common__NotSuperAdmin',
      );
    });

    it('restricts all transfers', async () => {
      expect(await gatewayToken.transfersRestricted()).to.be.true;
    });
  });

  describe('Charge', () => {
    const forward = async (
      tx: ContractTransaction,
      from: SignerWithAddress,
      value?: bigint,
    ): Promise<ContractTransactionReceipt> => {
      const input = {
        from: gatekeeper.address,
        to: gatewayTokenAddress,
        data: tx.data as string,
        gas: 500_000,
        ...(value ? { value } : {}),
      };
      const { request, signature } = await signMetaTxRequest(gatekeeper, forwarder as IForwarder, input);

      // send the forwarded transaction
      const forwarderTx = await forwarder.connect(from).execute(request, signature, { gasLimit: 1000000, value });
      const receipt = await forwarderTx.wait();
      expect(receipt?.status).to.equal(1);

      if (!receipt) throw new Error('No receipt');

      return receipt;
    };

    it('cannot add some other contract as a charge caller if not an admin', async () => {
      // A charge caller is a contract that is permitted to ask the charge handler to charge a user
      await expect(
        chargeHandlerFor(alice).setRole(keccak256(toUtf8Bytes('CHARGE_CALLER_ROLE')), alice.address),
      ).to.be.to.be.revertedWith(/AccessControl/);
    });

    it('cannot call initialize on ChargeHandler after deployment', async () => {
      await expect(chargeHandler.initialize(alice.address)).to.be.revertedWith(
        /Initializable: contract is already initialized/,
      );
    });

    context('ETH', () => {
      it('can charge ETH through a forwarded call', async () => {
        const charge = makeWeiCharge(ethers.parseEther('0.1'));
        const balanceBefore = await alice.provider.getBalance(alice.address);

        // create a mint transaction
        const tx = await gatewayTokenFor(gatekeeper).mint.populateTransaction(alice.address, gkn1, 0, 0, charge);

        // forward it so that Alice sends it, and includes a value
        const receipt = await forward(tx, alice, charge.value);

        // check that Alice's balance has gone down by the charge amount + gas
        const balanceAfter = await alice.provider.getBalance(alice.address);
        const gas = receipt.gasUsed * receipt.gasPrice;
        expect(balanceAfter).to.equal(balanceBefore - charge.value - gas);
      });

      it('charge ETH - revert if the recipient rejects it', async () => {
        const brokenRecipientFactory = await ethers.getContractFactory('DummyBrokenEthRecipient');
        const brokenRecipient = await brokenRecipientFactory.deploy();
        await brokenRecipient.waitForDeployment();

        const charge = makeWeiCharge(ethers.parseEther('0.1'));
        charge.recipient = await brokenRecipient.getAddress();

        // create a mint transaction
        const tx = await gatewayTokenFor(gatekeeper).mint.populateTransaction(alice.address, gkn1, 0, 0, charge);

        // forward it so that Alice sends it, and includes a value
        // this should fail, because the recipient rejects it
        await expect(forward(tx, alice, charge.value)).to.be.revertedWithCustomError(
          chargeHandler,
          'Charge__TransferFailed',
        );
      });

      it('can charge ETH - revert if amount sent is lower than the charge', async () => {
        const charge = makeWeiCharge(ethers.parseEther('0.1'));

        // create a mint transaction
        const tx = await gatewayTokenFor(gatekeeper).mint.populateTransaction(alice.address, gkn1, 0, 0, charge);

        // forward it so that Alice sends it. Alice tries to include a lower value than the charge
        await expect(forward(tx, alice, ethers.parseEther('0.05'))).to.be.revertedWithCustomError(
          chargeHandler,
          'Charge__IncorrectValue',
        );
      });

      it('can charge ETH - revert if amount sent is higher than the charge', async () => {
        const charge = makeWeiCharge(ethers.parseEther('0.1'));

        // create a mint transaction
        const tx = await gatewayTokenFor(gatekeeper).mint.populateTransaction(alice.address, gkn1, 0, 0, charge);

        // forward it so that Alice sends it. Alice tries to include a higher value than the charge
        await expect(forward(tx, alice, ethers.parseEther('0.15'))).to.be.revertedWithCustomError(
          chargeHandler,
          'Charge__IncorrectValue',
        );
      });

      it('can charge ETH - revert if no amount sent', async () => {
        const charge = makeWeiCharge(ethers.parseEther('0.1'));

        // create a mint transaction
        const tx = await gatewayTokenFor(gatekeeper).mint.populateTransaction(alice.address, gkn1, 0, 0, charge);

        // forward it so that Alice sends it. Alice tries to send it without a value
        await expect(forward(tx, alice)).to.be.revertedWithCustomError(chargeHandler, 'Charge__IncorrectValue');
      });

      it('can charge ETH - revert if charge is too high', async () => {
        const balance = await alice.provider.getBalance(alice.address);
        const charge = makeWeiCharge(balance * 2n);
        const shouldFail = gatewayTokenFor(alice).mint(alice.address, gkn1, 0, 0, charge, { value: charge.value });
        await expect(shouldFail).to.be.rejectedWith(/sender doesn't have enough funds/i);
      });
    });

    context('ERC20', () => {
      let erc20: DummyERC20;

      before('deploy ERC20 token', async () => {
        const erc20Factory = await ethers.getContractFactory('DummyERC20');
        erc20 = await erc20Factory.deploy('dummy erc20', 'dummy', ethers.parseEther('1000000'), alice.address);
        await erc20.waitForDeployment();
      });

      it('can charge ERC20 - rejects if the ERC20 allowance was not made', async () => {
        const charge = makeERC20Charge(100n, await erc20.getAddress(), alice.address);

        // create a mint transaction
        const tx = await gatewayTokenFor(gatekeeper).mint.populateTransaction(alice.address, gkn1, 0, 0, charge);

        await expect(forward(tx, alice)).to.be.revertedWithCustomError(chargeHandler, 'Charge__IncorrectAllowance');
      });

      it('can charge ERC20 - reject if no internal allowance has been made', async () => {
        const charge = makeERC20Charge(100n, await erc20.getAddress(), alice.address);

        // Alice allows the gateway token contract to transfer 100 to the gatekeeper
        await erc20.connect(alice).approve(chargeHandlerAddress, charge.value);

        // create a mint transaction
        const tx = await gatewayTokenFor(gatekeeper).mint.populateTransaction(alice.address, gkn1, 0, 0, charge);

        await expect(forward(tx, alice)).to.be.revertedWithCustomError(chargeHandler, 'Charge__IncorrectAllowance');
      });

      it('can charge ERC20 - reject if the ERC20 allowance is insufficient', async () => {
        const charge = makeERC20Charge(100n, await erc20.getAddress(), alice.address);

        // Alice allows the gateway token contract to transfer 90 to the gatekeeper
        await erc20.connect(alice).approve(chargeHandlerAddress, charge.value - 10n);

        // Alice allows the gateway token contract to transfer 100 in the context of the gatekeeper network
        await chargeHandlerFor(alice).setApproval(gatewayTokenAddress, await erc20.getAddress(), charge.value, gkn1);

        // create a mint transaction
        const tx = await gatewayTokenFor(gatekeeper).mint.populateTransaction(alice.address, gkn1, 0, 0, charge);

        await expect(forward(tx, alice)).to.be.revertedWith('ERC20: insufficient allowance');
      });

      it('can charge ERC20 - reject if the internal allowance is insufficient', async () => {
        const charge = makeERC20Charge(100n, await erc20.getAddress(), alice.address);

        // Alice allows the gateway token contract to transfer 100 to the gatekeeper
        await erc20.connect(alice).approve(chargeHandlerAddress, charge.value);

        // Alice allows the gateway token contract to transfer 90 in the context of the gatekeeper network
        await chargeHandlerFor(alice).setApproval(
          gatewayTokenAddress,
          await erc20.getAddress(),
          charge.value - 10n,
          gkn1,
        );

        // create a mint transaction
        const tx = await gatewayTokenFor(gatekeeper).mint.populateTransaction(alice.address, gkn1, 0, 0, charge);

        await expect(forward(tx, alice)).to.be.revertedWithCustomError(chargeHandler, 'Charge__IncorrectAllowance');
      });

      it('can charge ERC20 - reject if the internal allowance is for a different token', async () => {
        const charge = makeERC20Charge(100n, await erc20.getAddress(), alice.address);

        // Alice allows the gateway token contract to transfer 100 to the gatekeeper
        await erc20.connect(alice).approve(chargeHandlerAddress, charge.value);

        // Alice allows the gateway token contract to transfer 100 of some other token in the context of the gatekeeper network
        const someOtherTokenAddress = randomAddress();
        await chargeHandlerFor(alice).setApproval(gatewayTokenAddress, someOtherTokenAddress, charge.value, gkn1);

        // create a mint transaction
        const tx = await gatewayTokenFor(gatekeeper).mint.populateTransaction(alice.address, gkn1, 0, 0, charge);

        await expect(forward(tx, alice)).to.be.revertedWithCustomError(chargeHandler, 'Charge__IncorrectAllowance');
      });

      it('can charge ERC20 - reject if ETH is sent with the transaction', async () => {
        const charge = makeERC20Charge(100n, await erc20.getAddress(), alice.address);

        // Alice allows the gateway token contract to transfer 90 to the gatekeeper
        await erc20.connect(alice).approve(chargeHandlerAddress, charge.value);

        // Alice allows the gateway token contract to transfer 100 in the context of the gatekeeper network
        await chargeHandlerFor(alice).setApproval(gatewayTokenAddress, await erc20.getAddress(), charge.value, gkn1);

        // create a mint transaction
        const tx = await gatewayTokenFor(gatekeeper).mint.populateTransaction(alice.address, gkn1, 0, 0, charge);

        await expect(forward(tx, alice, ethers.parseEther('0.15'))).to.be.revertedWithCustomError(
          chargeHandler,
          'Charge__IncorrectValue',
        );
      });

      it('can charge ERC20 through a forwarded call', async () => {
        const charge = makeERC20Charge(100n, await erc20.getAddress(), alice.address);
        const balanceBefore = await erc20.balanceOf(alice.address);

        // Alice allows the gateway token contract to transfer 100 to the gatekeeper
        await erc20.connect(alice).approve(chargeHandlerAddress, charge.value);

        // Alice allows the gateway token contract to transfer 100 in the context of the gatekeeper network
        await chargeHandlerFor(alice).setApproval(gatewayTokenAddress, await erc20.getAddress(), charge.value, gkn1);

        // create a mint transaction
        const tx = await gatewayTokenFor(gatekeeper).mint.populateTransaction(alice.address, gkn1, 0, 0, charge);

        // forward it so that Alice sends it
        await forward(tx, alice);

        // check that Alice's balance has gone down by the charge amount
        const balanceAfter = await erc20.balanceOf(alice.address);
        expect(balanceAfter).to.equal(balanceBefore - charge.value);
      });

      it('charge ERC20 - allows someone else to forward and pay the fee', async () => {
        // Alice will be forwarding the tx and paying the fee on behalf of bob
        // no connection between the fee payer, forwarder and the gateway token recipient
        const charge = makeERC20Charge(100n, await erc20.getAddress(), alice.address);
        const balanceBefore = await erc20.balanceOf(alice.address);

        // Alice allows the gateway token contract to transfer 100 to the gatekeeper
        await erc20.connect(alice).approve(chargeHandlerAddress, charge.value);

        // Alice allows the gateway token contract to transfer 100 in the context of the gatekeeper network
        await chargeHandlerFor(alice).setApproval(gatewayTokenAddress, await erc20.getAddress(), charge.value, gkn1);

        // create a mint transaction for bob
        const tx = await gatewayTokenFor(gatekeeper).mint.populateTransaction(bob.address, gkn1, 0, 0, charge);

        // forward it so that Alice sends it
        await forward(tx, alice);

        // check that Alice's balance has gone down by the charge amount
        const balanceAfter = await erc20.balanceOf(alice.address);
        expect(balanceAfter).to.equal(balanceBefore - charge.value);
      });

      it('charge ERC20 - allows someone else to pay the fee, without forwarding', async () => {
        // Bob will be forwarding the tx, but Alice will be paying the fee on behalf of bob
        // no connection between the fee payer, forwarder and the gateway token recipient
        const charge = makeERC20Charge(100n, await erc20.getAddress(), alice.address);
        const balanceBefore = await erc20.balanceOf(alice.address);

        // Alice allows the gateway token contract to transfer 100 to the gatekeeper
        await erc20.connect(alice).approve(chargeHandlerAddress, charge.value);

        // Alice allows the gateway token contract to transfer 100 in the context of the gatekeeper network
        await chargeHandlerFor(alice).setApproval(gatewayTokenAddress, await erc20.getAddress(), charge.value, gkn1);

        // create a mint transaction for bob
        const tx = await gatewayTokenFor(gatekeeper).mint.populateTransaction(bob.address, gkn1, 0, 0, charge);

        // forward it so that Bob sends it
        await forward(tx, bob);

        // check that Alice's balance has gone down by the charge amount
        const balanceAfter = await erc20.balanceOf(alice.address);
        expect(balanceAfter).to.equal(balanceBefore - charge.value);
      });

      it('can charge ERC20 - rejects if the ERC20 transfer fails', async () => {
        const brokenErc20Factory = await ethers.getContractFactory('DummyBrokenERC20');
        const brokenErc20 = await brokenErc20Factory.deploy(
          'broken erc20',
          'dummyBroken',
          ethers.parseEther('1000000'),
          alice.address,
        );
        await brokenErc20.waitForDeployment();

        const charge = makeERC20Charge(100n, await brokenErc20.getAddress(), alice.address);

        // Alice allows the gateway token contract to transfer 100 to the gatekeeper
        await brokenErc20.connect(alice).approve(chargeHandlerAddress, charge.value);
        // Alice allows the gateway token contract to transfer 100 in the context of the gatekeeper network
        await chargeHandlerFor(alice).setApproval(
          gatewayTokenAddress,
          await brokenErc20.getAddress(),
          charge.value,
          gkn1,
        );

        // create a mint transaction
        const tx = await gatewayTokenFor(gatekeeper).mint.populateTransaction(alice.address, gkn1, 0, 0, charge);

        // the transfer fails because the erc20 contract blocked it
        await expect(forward(tx, alice)).to.be.revertedWith(/ERC20 operation did not succeed/);
      });

      it('can charge ERC20 - rejects if the charge handler is called directly', async () => {
        const charge = makeERC20Charge(100n, await erc20.getAddress(), alice.address);

        // Alice allows the gateway token contract to transfer 100 to the gatekeeper
        await erc20.connect(alice).approve(chargeHandlerAddress, charge.value);

        // Alice allows the gateway token contract to transfer 100 in the context of the gatekeeper network
        await chargeHandlerFor(alice).setApproval(gatewayTokenAddress, await erc20.getAddress(), charge.value, gkn1);

        // attempt to call chargeHandler directly rather than via a gatewayToken mint
        const attacker = randomWallet();
        const maliciousCharge = {
          ...charge,
          recipient: attacker.address,
        };
        // it doesn't matter who sends the transaction
        const shouldFail = chargeHandlerFor(alice).handleCharge(maliciousCharge, gkn1);

        await expect(shouldFail).to.be.revertedWith(/AccessControl/);
      });
    });
  });

  describe('Test gateway token future version upgradeability', async () => {
    it('upgrades the gateway token contract to v2', async () => {
      const gatewayTokenV2Factory = await ethers.getContractFactory('GatewayTokenUpgradeTest');
      await upgrades.upgradeProxy(gatewayTokenAddress, gatewayTokenV2Factory);
    });

    it('existing tokens are still valid after the upgrade', async () => {
      let verified = await gatewayTokenFor(alice)['verifyToken(address,uint256)'](alice.address, gkn1);
      expect(verified).to.be.true;
    });

    it('can issue a token with a positive expiry', async () => {
      const currentDate = Math.ceil(Date.now() / 1000);
      const tomorrow = currentDate + 86_400;

      const wallet = randomWallet();
      await gatewayTokenFor(gatekeeper).mint(wallet.address, gkn1, tomorrow, 0, NULL_CHARGE);

      let verified = await gatewayToken['verifyToken(address,uint256)'](wallet.address, gkn1);
      expect(verified).to.be.true;
    });

    it('can no longer issue a token with no expiry (testing the upgraded behaviour)', async () => {
      const wallet = randomWallet();

      await expect(gatewayTokenFor(gatekeeper).mint(wallet.address, gkn1, 0, 0, NULL_CHARGE)).to.be.revertedWith(
        'TEST MODE: Expiry must be > zero',
      );
    });

    it('upgrades the flags storage contract to v2', async () => {
      // just using the same contract here, to test the upgradeability feature
      const flagsStorageV2Factory = await ethers.getContractFactory('FlagsStorage');
      await upgrades.upgradeProxy(flagsStorageAddress, flagsStorageV2Factory);
    });

    it('upgrades the flags storage contract to v2 - reverts if not superadmin', async () => {
      // just using the same contract here, to test the upgradeability feature
      const flagsStorageV2Factory = await ethers.getContractFactory('FlagsStorage');
      await expect(
        upgrades.upgradeProxy(flagsStorageAddress, flagsStorageV2Factory.connect(bob)),
      ).to.be.revertedWithCustomError(gatewayToken, 'Common__NotSuperAdmin');
    });

    it('upgrades the charge handler contract to v2', async () => {
      // just using the same contract here, to test the upgradeability feature
      const chargeHandlerV2Factory = await ethers.getContractFactory('ChargeHandler');
      await upgrades.upgradeProxy(chargeHandlerAddress, chargeHandlerV2Factory);
    });

    it('upgrades the charge handler contract to v2 - reverts if not superadmin', async () => {
      // just using the same contract here, to test the upgradeability feature
      const chargeHandlerV2Factory = await ethers.getContractFactory('ChargeHandler');
      await expect(upgrades.upgradeProxy(chargeHandlerAddress, chargeHandlerV2Factory.connect(bob))).to.be.revertedWith(
        /AccessControl/,
      );
    });
  });

  describe('Test gateway token upgradeability from v0 (pre-issuing-gatekeeper and charge features)', async () => {
    let gatewayTokenForUpgrade;
    let upgradedGatewayToken: GatewayToken;

    before('deploys the v0 gateway token contract, issues a pass, then upgrades', async () => {
      // Deploy the old contract version
      const gatewayTokenV0Factory = await ethers.getContractFactory('GatewayTokenV0');
      const args = ['Gateway Protocol', 'GWY', identityCom.address, flagsStorageAddress, [forwarderAddress]];
      gatewayTokenForUpgrade = await upgrades.deployProxy(gatewayTokenV0Factory, args, { kind: 'uups' });
      await gatewayTokenForUpgrade.waitForDeployment();

      // create a gkn, add the gatekeeper, and mint a token
      await gatewayTokenForUpgrade.connect(identityCom).createNetwork(gkn1, 'Test GKN 1', false, ZERO_ADDRESS);
      await gatewayTokenForUpgrade.connect(identityCom).addGatekeeper(gatekeeper.address, gkn1);
      await gatewayTokenForUpgrade.connect(gatekeeper).mint(alice.address, gkn1, 0, 0, NULL_CHARGE);

      // verify that the token is issued
      let verified = await gatewayTokenForUpgrade['verifyToken(address,uint256)'](alice.address, gkn1);
      expect(verified).to.be.true;

      // upgrade the contract to the current version
      const gatewayTokenFactory = await ethers.getContractFactory('GatewayToken');
      await upgrades.upgradeProxy(await gatewayTokenForUpgrade.getAddress(), gatewayTokenFactory);
      upgradedGatewayToken = await ethers.getContractAt('GatewayToken', await gatewayTokenForUpgrade.getAddress());

      // set the new chargeHandler storage address
      await upgradedGatewayToken.connect(identityCom).updateChargeHandler(chargeHandlerAddress);
      await chargeHandlerFor(identityCom).setRole(
        keccak256(toUtf8Bytes('CHARGE_CALLER_ROLE')),
        await upgradedGatewayToken.getAddress(),
      );
    });

    it('existing tokens are still valid after the upgrade', async () => {
      let verified = await upgradedGatewayToken['verifyToken(address,uint256)'](alice.address, gkn1);
      expect(verified).to.be.true;
    });

    it('existing tokens can be refreshed after the upgrade', async () => {
      const [tokenId] = await upgradedGatewayToken.getTokenIdsByOwnerAndNetwork(alice.address, gkn1, true);
      const value = ethers.parseEther('0.1');
      const charge = makeWeiCharge(value);
      // Since we are not forwarding the transaction, the gatekeeper will actually pay the charge here.
      // We are just testing the logic here and not who pays.
      await upgradedGatewayToken
        .connect(gatekeeper)
        .setExpiration(tokenId, Date.parse('2030-01-01') / 1000, charge, { value });
      // if the above does not fail, all is good.
    });

    it('existing tokens have no gatekeeper field', async () => {
      const tokenId = await upgradedGatewayToken.tokenOfOwnerByIndex(alice.address, 0);
      const issuingGatekeeper = await upgradedGatewayToken.getIssuingGatekeeper(tokenId);

      expect(issuingGatekeeper).to.equal(ZERO_ADDRESS);
    });

    it('new tokens can be issued, and store the gatekeeper field', async () => {
      await upgradedGatewayToken.connect(gatekeeper).mint(bob.address, gkn1, 0, 0, NULL_CHARGE);
      let verified = await upgradedGatewayToken['verifyToken(address,uint256)'](bob.address, gkn1);
      expect(verified).to.be.true;

      const tokenId = await upgradedGatewayToken.tokenOfOwnerByIndex(bob.address, 0);
      const issuingGatekeeper = await upgradedGatewayToken.getIssuingGatekeeper(tokenId);

      expect(issuingGatekeeper).to.equal(gatekeeper.address);
    });
  });
});

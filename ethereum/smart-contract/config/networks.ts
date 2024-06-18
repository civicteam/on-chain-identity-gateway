export const defaultPath = './contracts';

const derivedAccounts = {
    mnemonic: process.env.MNEMONIC || 'test test test test test test test test test test test junk',
    path: process.env.MNEMONIC_PATH || "m/44'/60'/0'/0/",
    initialIndex: 0,
    count: 20,
};
const liveAccounts =
    process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY
        ? [
            `0x${process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY}`,
            `0x${process.env.GATEKEEPER_PRIVATE_KEY || process.env.PRIVATE_KEY}`,
        ]
        : [];
export const networks = {
    hardhat: {
        allowUnlimitedContractSize: false,
        accounts:
            process.env.NODE_ENV === 'test'
                ? derivedAccounts
                : liveAccounts.map((a) => ({privateKey: a, balance: '10000000000000000000000'})),
    },
    localhost: {
        allowUnlimitedContractSize: false,
        accounts: liveAccounts,
    },
    mainnet: {
        url: process.env.MAINNET_RPC ?? `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
        accounts: liveAccounts,
        chainId: 1,
    },
    sepolia: {
        url: process.env.SEPOLIA_RPC ?? `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
        accounts: liveAccounts,
        chainId: 11155111,
    },
    polygonMainnet: {
        url: process.env.POLYGON_RPC ?? `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
        accounts: liveAccounts,
        chainId: 137,
    },
    polygonAmoy: {
        url: process.env.POLYGONAMOY_RPC ??`https://polygon-amoy.infura.io/v3/${process.env.INFURA_API_KEY}`,
        accounts: liveAccounts,
        chainId: 80002,
    },
    auroraTestnet: {
        url: process.env.AURORATESTNET_RPC ??`https://aurora-testnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
        accounts: liveAccounts,
        chainId: 1313161555,
    },
    auroraMainnet: {
        url: process.env.AURORA_RPC ??`https://aurora-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
        accounts: liveAccounts,
        chainId: 1313161554,
    },
    optimismSepolia: {
        url: process.env.OPSEPOLIA_RPC ??`https://sepolia.optimism.io`,
        accounts: liveAccounts,
        chainId: 11155420,
        // optimism sepolia deployment is only reliable if a gas price is set - the gas oracles are not reliable
        gasPrice: 1_000_000_000,
    },
    optimismMainnet: {
        url: process.env.OP_RPC ??`https://optimism-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
        accounts: liveAccounts,
        chainId: 10,
    },
    palmTestnet: {
        url: process.env.PALMTESTNET_RPC ??`https://palm-testnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
        accounts: liveAccounts,
        chainId: 11297108099,
    },
    palmMainnet: {
        url: process.env.PALM_RPC ??`https://palm-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
        accounts: liveAccounts,
        chainId: 11297108109,
    },
    arbitrumSepolia: {
        url: process.env.ARBSEPOLIA_RPC ??`https://sepolia-rollup.arbitrum.io/rpc`,
        accounts: liveAccounts,
        chainId: 421614,
    },
    arbitrumMainnet: {
        url: process.env.AR_RPC ??`https://arbitrum-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
        accounts: liveAccounts,
        chainId: 42161,
    },
    celoMainnet: {
        url: process.env.CELO_RPC ??`https://celo-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
        accounts: liveAccounts,
        chainId: 42220,
    },
    celoAlfajores: {
        url: process.env.CELOALFAJORES_RPC ??`https://celo-alfajores.infura.io/v3/${process.env.INFURA_API_KEY}`,
        accounts: liveAccounts,
        chainId: 44787,
    },
    avalancheCChain: {
        url: process.env.AVA_RPC ??`https://avalanche-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
        accounts: liveAccounts,
        chainId: 43114,
    },
    avalancheCChainFuji: {
        url: process.env.AVAFUJI_RPC ??`https://avalanche-fuji.infura.io/v3/${process.env.INFURA_API_KEY}`,
        accounts: liveAccounts,
        chainId: 43113,
    },
    starknetMainnet: {
        url: process.env.STARKNET_RPC ??`https://starknet-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
        accounts: liveAccounts,
        chainId: 0, // not documented anywhere
    },
    xdc: {
        url: process.env.XDC_RPC ??'https://erpc.xinfin.network',
        accounts: liveAccounts,
        chainId: 50,
    },
    xdcApothem: {
        url: process.env.XDCAPOTHEM_RPC ??'https://erpc.apothem.network',
        accounts: liveAccounts,
        chainId: 51,
    },
    polygonZkEVM: {
        url: process.env.POLYGONZKEVM_RPC ??'https://zkevm-rpc.com',
        accounts: liveAccounts,
        chainId: 1101,
    },
    polygonZkEVMTestnet: {
        url: process.env.POLYGONZKEVMTESTNET_RPC ??'https://rpc.public.zkevm-test.net',
        accounts: liveAccounts,
        chainId: 1442,
    },
    fantom: {
        url: process.env.FANTOM_RPC ??'https://rpcapi.fantom.network',
        accounts: liveAccounts,
        chainId: 250,
    },
    fantomTestnet: {
        url: process.env.FANTOMTESTNET_RPC ??'https://rpc.testnet.fantom.network',
        accounts: liveAccounts,
        chainId: 4002,
    },
    baseSepolia: {
        url: process.env.BASESEPOLIA_RPC ??'https://sepolia.base.org',
        accounts: liveAccounts,
        chainId: 84532,
        // set a gas price - the gas oracles are not reliable
        gasPrice: 150000005,
    },
    base: {
        url: process.env.BASE_RPC ??'https://base.llamarpc.com',
        accounts: liveAccounts,
        chainId: 8453,
    },
    bsc: {
        url: process.env.BSC_RPC ??'https://bsc-dataseed1.bnbchain.org',
        accounts: liveAccounts,
        chainId: 56,
    },
    bscTestnet: {
        // url: `https://bnbsmartchain-testnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
        url: process.env.BSCTESTNET_RPC ?? 'https://bsc-testnet.publicnode.com',
        accounts: liveAccounts,
        chainId: 97,
    },
    linea: {
        url: process.env.LINEA_RPC ?? `https://linea-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
        accounts: liveAccounts,
        chainId: 59144,
    },
    gnosis: {
        url: process.env.GNOSIS_RPC ?? 'https://rpc.gnosischain.com',
        accounts: liveAccounts,
        chainId: 100
    },
    gnosisChiado: {
        url: process.env.GNOSISCHIADO_RPC ?? 'https://rpc.chiadochain.net',
        accounts: liveAccounts,
        chainId: 10200,
        gasPrice: 1500000005,
    },
    klaytn: {
        url: process.env.KLAYTN_RPC ?? 'https://public-en-cypress.klaytn.net',
        accounts: liveAccounts,
        chainId: 8217,
    },
    klaytnBaobab: {
        url: process.env.KLAYTONBAOBAB_RPC ?? 'https://api.baobab.klaytn.net:8651',
        accounts: liveAccounts,
        chainId: 1001,
    },
    zkSync: {
        url: process.env.ZKSYNC_RPC ?? 'https://mainnet.era.zksync.io',
        accounts: liveAccounts,
        chainId: 324,
    },
    oasisSapphireTestnet: {
        url: 'https://testnet.sapphire.oasis.dev',
        accounts: liveAccounts,
        chainId: 23295,
    },
    oasisSapphire: {
        url: 'https://sapphire.oasis.io',
        accounts: liveAccounts,
        chainId: 23294,
    },
    cotiDevnet: {
        url: "https://devnet.coti.io",
        accounts: liveAccounts,
        chainId: 13068200,
    }
};
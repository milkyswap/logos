const { Command } = require("commander");
const { exec } = require("child_process");
const fs = require("fs");
const { resolve } = require("path");
const { getAddress } = require("@ethersproject/address");

const ChainId = {
  MAINNET = 1,
  ETHEREUM = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  GÖRLI = 5,
  KOVAN = 42,
  MILKOMEDA_TESTNET = 200101,
}

const program = new Command();

const NAME_TO_CHAIN_ID = {
  ethereum: ChainId.ETHEREUM,
  ropsten: [ChainId.ROPSTEN],
  rinkeby: [ChainId.RINKEBY],
  kovan: [ChainId.KOVAN],
  gorli: [ChainId.GÖRLI],
  milkomedaTestnet: [ChainId.MILKOMEDA_TESTNET]
};

const CHAIN_ID_TO_NAME = {
  [ChainId.ETHEREUM]: "ethereum",
  [ChainId.MILKOMEDA_TESTNET]: "milkomedaTestnet",
};

// TODO: #8 Add network and agnostic clone command to bin/index.js which
// will for example clone
// from token/eth.jpg
// to network/arbitrum/0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f.jpg

program
  .command("clone")
  .arguments("<name> <network> <address>")
  .action((name, network, address) => {
    console.log(
      `Performing clone of ${name}.jpg from the tokens directory to network/${network}/${address}.jpg`
    );

    if (!(network in NAME_TO_CHAIN_ID)) {
      throw Error(`No network for ${network}`);
    }

    const from = resolve(__dirname, `../token/${name}.jpg`);

    if (!fs.existsSync(from)) {
      throw Error(`No token found with name ${name} at path ${path}`);
    }

    const to = resolve(
      __dirname,
      `../network/${network}/${getAddress(address)}.jpg`
    );

    exec(`cp ${from} ${to}`, () => console.log(`Copied ${from} -> ${to}`));
  });

program.command("invalidate:all").action(() => {
  console.log("invalidate:all command called");
  for (const chainId of Object.keys(ChainId)) {
    if (!(chainId in CHAIN_ID_TO_NAME)) {
      console.error(
        `No name to map from chainId: ${chainId} -> name: ${CHAIN_ID_TO_NAME[chainId]}`
      );
      continue;
    }

    console.log(`Invalidate cache for network ${CHAIN_ID_TO_NAME[chainId]}`);

    const path = resolve(__dirname, `../network/${CHAIN_ID_TO_NAME[chainId]}`);

    console.log({ path });

    if (!fs.existsSync(path)) {
      console.error(`No network found for path ${path}`);
      continue;
    }

    fs.readdir(path, (error, files) => {
      if (error) console.error(error);
      for (const token of files) {
        console.log(
          `Invalidating https://raw.githubusercontent.com/milkyswap/logos/main/${CHAIN_ID_TO_NAME[chainId]}/${token}`
        );
        exec(
          `/usr/local/bin/cld uploader explicit "https://raw.githubusercontent.com/milkyswap/logos/main/${CHAIN_ID_TO_NAME[chainId]}/${token}" type="fetch" invalidate="true" eager='[{ "width": 24 }, { "width": 32 }, { "width": 48 }, { "width": 64 }, { "width": 96 }, { "width": 128 }]'`,
          () =>
            console.log(
              `Invalidated https://raw.githubusercontent.com/milkyswap/logos/main/${CHAIN_ID_TO_NAME[chainId]}/${token}`
            )
        );
      }
    });
  }
});

program
  .command("invalidate:network")
  .arguments("<network>")
  .action((network) => {
    console.log("invalidate:network command called", { network });

    if (!network) {
      throw Error(`No network configured for ${network}`);
    }

    const NETWORK =
      Number(network) in CHAIN_ID_TO_NAME ? CHAIN_ID_TO_NAME[network] : network;

    console.log(`Invalidating cache for network ${NETWORK}`);

    const path = resolve(__dirname, `../network/${NETWORK}`);

    if (!fs.existsSync(path)) {
      throw Error(`Path does not exist for ${path}`);
    }

    fs.readdir(path, (error, files) => {
      if (error) console.error(error);
      for (const token of files) {
        console.log(
          `Invalidating https://raw.githubusercontent.com/milkyswap/logos/main/network/${NETWORK}/${token}`
        );
        exec(
          `/usr/local/bin/cld uploader explicit "https://raw.githubusercontent.com/milkyswap/logos/main/network/${NETWORK}/${token}" type="fetch" invalidate="true" eager='[{ "width": 24 }, { "width": 32 }, { "width": 48 }, { "width": 54 }, { "width": 64 }, { "width": 96 }, { "width": 128 }]'`,
          () =>
            console.log(
              `Invalidated https://raw.githubusercontent.com/milkyswap/logos/main/network/${NETWORK}/${token}`
            )
        );
      }
    });
  });

program
  .command("invalidate:token")
  .arguments("<network> <token>")
  .action((network, token) => {
    console.log("invalidate:token command called", { network, token });

    if (!network) {
      throw Error("No network was passed");
    }

    if (!token) {
      throw Error("No token was passed");
    }

    const NETWORK =
      Number(network) in CHAIN_ID_TO_NAME ? CHAIN_ID_TO_NAME[network] : network;

    console.log(`Invalidate cache for network ${NETWORK} and token ${token}`);

    const path = resolve(__dirname, `../network/${NETWORK}/${token}.jpg`);

    if (!fs.existsSync(path)) {
      throw Error(`Path does not exist for ${path}`);
    }

    console.log(
      `Invalidating https://raw.githubusercontent.com/milkyswap/logos/main/network/${NETWORK}/${token}.jpg`
    );

    exec(
      `/usr/local/bin/cld uploader explicit "https://raw.githubusercontent.com/milkyswap/logos/main/network/${NETWORK}/${token}.jpg" type="fetch" invalidate="true" eager='[{ "width": 24 }, { "width": 32 }, { "width": 48 }, { "width": 54 }, { "width": 64 }, { "width": 96 }, { "width": 128 }]'`,
      (error, stdout) => {
        if (error) {
          console.error(error);
        } else {
          console.log(stdout);
          console.log(
            `Invalidated https://raw.githubusercontent.com/milkyswap/logos/main/network/${NETWORK}/${token}.jpg`
          );
        }
      }
    );
  });

program.parse(process.argv);

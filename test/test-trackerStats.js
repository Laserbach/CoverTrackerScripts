const { assert } = require("chai");
const axios = require("axios");

let dai;
const daiAddr = "0x6b175474e89094c44da98b954eedeac495271d0f";
let yDai;
const yDaiAddr = "0x16de59092dAE5CcF4A1E6439D611fd0653f0Bd01";

// Coverages
const protocolFactory = "0xedfC81Bf63527337cD2193925f9C0cF2D537AccA";
const bFactoryAddr = "0x9424B1412450D0f8Fc2255FAf6046b98213B76Bd";
const claimPools = ["0xdfe5ead7bd050eb74009e7717000eeadcf0f18db", "0xb9efee79155b4bd6d06dd1a4c8babde306960bab", "0xe7f5b65126dd3cfe341313d1e9fa5c6d8865c652", "0xbad3ca7e741f785a05d7b3394db79fcc4b6d85af", "0x6cd4eaae3b61a04002e5543382f2b4b1a364871d", "0x94bcc44db60fca1c6442fa6b0684d54c0a1ada4f"];
const noClaimPools = ["0xd9b92e84b9f96267bf548cfe3a3ae21773872138", "0x0490b8bc5898eac3e41857d560f0a58aa393321e", "0x64dd4573297dd5ce7199a5d31a5be185e8d8c80d", "0xa553c12ab7682efda28c47fdd832247d62788273", "0x4533c2377522c61fc9c6efd3e6a3abe1b2b44022", "0x8e0b1cd5d32477b3d7fb2da9d7f66a2ac7223f0f"];
const coverageNames = ["CURVE", "AAVE", "PICKLE", "BADGER", "MUSHROOMS", "PERP"];
const coverAddr = ["0x5104f23653df6695D9d2B91c952F47F9ffbDE744", "0x8ce9e9c8d6ebb919ca7db573737d7c4acdd904f8", "0xa20604463cb1a618e76ab131517d7cb589b70faa", "0x2078b0d5184c5c0725a5673ebc33b5bbf92269e4", "0x104ef919d365cd02973a745bb00fbad93b305eea", "0xb0e011f5baae39a49280dd4c6487c17c1166f300"];
const pairedTokenAddr = [daiAddr, daiAddr, daiAddr, daiAddr, daiAddr, daiAddr];
const protocolAddr = ["0xc89432064d7cb658be730498dc07f1d850d6a867", "0x1246c212c68e44ededbd802ce43de38745c817c0", "0x345563971c01f6d4aad78b32e39808d894d036a4", "0x268c5809eab85598ed5537d54692e72ddb3598d6", "0x9014aa3d6ea5ae2a449f75913603000f93cf8181", "0x893678cee1089576e15a2cad576a85466d386a15"];

let factory;
let redeemFeeNumerator;
let redeemFeeDenominator;
let coverages = [];
let cover;
let protocol;
let timestamp;
let collateral;
let coverageMap = new Map();
let claimAddr;
let noClaimAddr;

describe("### Setup", function() {
  before(async () => {
    this.timeout(40000);
    deployer = ethers.provider.getSigner(0);

    const CoverRouter = await ethers.getContractFactory("CoverRouter");
    coverRouter = await CoverRouter.deploy(protocolFactory, bFactoryAddr);
    await coverRouter.deployed();

    factory = await ethers.getContractAt("IProtocolFactory", protocolFactory);
    redeemFeeNumerator = await factory.redeemFeeNumerator();
    redeemFeeDenominator = await factory.redeemFeeDenominator();

    dai = await ethers.getContractAt("IERC20", daiAddr);
    yDai = await ethers.getContractAt("IERC20", yDaiAddr);
  });

  it("should fetch data for 6 coverages (3 DAI based, 3 yDAI based) and set pools-mapping", async function() {
    this.timeout(100000);

    // create coverage mapping and feed CoverRouter
    for (let i=0; i < coverageNames.length; i++) {
      cover = await ethers.getContractAt("ICover", coverAddr[i]);
      protocol = await ethers.getContractAt("IProtocol", protocolAddr[i]);
      timestamp = await cover.expirationTimestamp();
      collateral = await cover.collateral();
      coverages[i] = {
          protocolAddr: protocolAddr[i],
          coverAddr: coverAddr[i],
          collateralAddr: collateral,
          timestamp: timestamp,
          pairedToken: pairedTokenAddr[i]
        };
      await coverageMap.set(coverageNames[i], coverages[i]);

      // register pools in CoverRouter
      claimAddr = await cover.claimCovToken();
      noClaimAddr = await cover.noclaimCovToken();
      await coverRouter.setPoolForPair(claimAddr, pairedTokenAddr[i], claimPools[i]);
      await coverRouter.setPoolForPair(noClaimAddr, pairedTokenAddr[i], noClaimPools[i]);
    }

    // // check mapping
    // for (var [key, value] of coverageMap.entries()) {
    //   console.log(" ### "+key+" ###")
    //   console.log(value);
    //   console.log("=======================")
    // }
  });
});

describe("### GET POOL STATS", function() {
  it("Get Amount of CLAIM Tokens in BPool", async function() {
    const [claimPool, noclaimPool, claimTokenAddr, noclaimTokenAddr] = await getCovPools("CURVE");
    const claimToken = await ethers.getContractAt("IERC20", claimTokenAddr);

    const amountClaimMinted = await claimToken.totalSupply();
    const amountClaimInPool = await claimPool.getBalance(claimTokenAddr);
    const amountCollateralInPool = await claimPool.getBalance(coverageMap.get("CURVE").collateralAddr);
    const amountClaimNotInPool = amountClaimMinted.sub(amountClaimInPool);

    console.log("Amount of CLAIM minted: " + ethers.utils.formatEther(amountClaimMinted).toString());
    console.log("Amount of CLAIM in BPool: " + ethers.utils.formatEther(amountClaimInPool).toString());
    console.log("Amount of DAI in BPool: " + ethers.utils.formatEther(amountCollateralInPool).toString())
    console.log("Amount of CLAIM not in pool: " + ethers.utils.formatEther(amountClaimNotInPool).toString());
  });

  // it("Calculate volume / fees needed to push CLAIM price to 1 DAI", async function() {
  //
  //   amountDaiInPool = await bpoolClaim.getBalance(daiAddr);
  //   const oneEther = ethers.utils.parseEther("1");
  //
  //   // weight
  //   const weightClaim = await bpoolClaim.getNormalizedWeight(claimAddr);
  //   const weightDai = await bpoolClaim.getNormalizedWeight(daiAddr);
  //
  //   // price
  //   const claimPrice = await bpoolClaim.getSpotPrice(daiAddr, claimAddr);
  //
  //   // swap fee
  //   const swapFee = await bpoolClaim.getSwapFee();
  //
  //   // calc amount of DAI to sell
  //   const slippagePerUnit = (1 - ethers.utils.formatEther(swapFee)) / (2 * ethers.utils.formatEther(amountDaiInPool) * ethers.utils.formatEther(weightClaim));
  //   const amountToBuy = (1 - ethers.utils.formatEther(claimPrice)) / (ethers.utils.formatEther(claimPrice) * slippagePerUnit)
  //   const totalSlippage = slippagePerUnit * amountToBuy * 100;
  //
  //   console.log("Amount of DAI in BPool: " + ethers.utils.formatEther(amountDaiInPool).toString());
  //   console.log("Amount of CLAIM in BPool: " + ethers.utils.formatEther(amountClaimInPool).toString());
  //   console.log("Fetched current CLAIM price: " + ethers.utils.formatEther(claimPrice).toString());
  //   console.log("Weight CLAIM: "+ethers.utils.formatEther(weightClaim).toString()+" __ Weight DAI: "+ethers.utils.formatEther(weightDai).toString());
  //   console.log("##########################################");
  //   console.log("Amount of CLAIM to buy (for 1 DAI = 1 CLAIM): "+amountToBuy.toString());
  //   console.log("Slippage per Unit: "+slippagePerUnit.toString()+" -- Total Slippage [%]: "+totalSlippage.toString());
  // });
});

describe("### CALCULATE COVERAGE DEMAND", function() {
  it("Get Subgraph data", async function() {

    const [claimPool, noclaimPool, claimTokenAddr, noclaimTokenAddr] = await getCovPools("CURVE");

    const result = await axios.post(
      "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer",
      {
        query: `
        {
          pool (id: "0xdfe5ead7bd050eb74009e7717000eeadcf0f18db") {
            totalSwapVolume
            totalSwapFee
            tokens {
              symbol
              address
            }
            swaps{
              tokenOut
              value
            }
          }
        }
        `
      }
    );

    // console.log(result.data.data.pool);

    let coverageDemand = 0;
    for(let i = 0; result.data.data.pool.swaps.length > i; i++){
        if(result.data.data.pool.swaps[i].tokenOut == claimTokenAddr.toLowerCase()) {
          coverageDemand += parseFloat(result.data.data.pool.swaps[i].value);
        }
    }
    console.log("Curve coverage demand: "+coverageDemand);
  });
});

async function getCovPools(coverage){
  let cover = await ethers.getContractAt("ICover", coverageMap.get(coverage).coverAddr);
  let claimTokenAddr = await cover.claimCovToken();
  let claimPoolAddr = await coverRouter.poolForPair(claimTokenAddr, coverageMap.get(coverage).pairedToken);
  let claimPool = await ethers.getContractAt("IBPool", claimPoolAddr);

  let noclaimTokenAddr = await cover.noclaimCovToken();
  let noclaimPoolAddr = await coverRouter.poolForPair(noclaimTokenAddr, coverageMap.get(coverage).pairedToken);
  let noclaimPool = await ethers.getContractAt("IBPool", noclaimPoolAddr);

  return [claimPool, noclaimPool, claimTokenAddr, noclaimTokenAddr];
}

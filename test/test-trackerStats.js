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

// describe("### Setup", function() {
//   before(async () => {
//     this.timeout(40000);
//     deployer = ethers.provider.getSigner(0);
//
//     const CoverRouter = await ethers.getContractFactory("CoverRouter");
//     coverRouter = await CoverRouter.deploy(protocolFactory, bFactoryAddr);
//     await coverRouter.deployed();
//
//     factory = await ethers.getContractAt("IProtocolFactory", protocolFactory);
//     redeemFeeNumerator = await factory.redeemFeeNumerator();
//     redeemFeeDenominator = await factory.redeemFeeDenominator();
//
//     dai = await ethers.getContractAt("IERC20", daiAddr);
//     yDai = await ethers.getContractAt("IERC20", yDaiAddr);
//   });
//
//   it("should fetch data for 6 coverages (3 DAI based, 3 yDAI based) and set pools-mapping", async function() {
//     this.timeout(100000);
//
//     // create coverage mapping and feed CoverRouter
//     for (let i=0; i < coverageNames.length; i++) {
//       cover = await ethers.getContractAt("ICover", coverAddr[i]);
//       protocol = await ethers.getContractAt("IProtocol", protocolAddr[i]);
//       timestamp = await cover.expirationTimestamp();
//       collateral = await cover.collateral();
//       coverages[i] = {
//           protocolAddr: protocolAddr[i],
//           coverAddr: coverAddr[i],
//           collateralAddr: collateral,
//           timestamp: timestamp,
//           pairedToken: pairedTokenAddr[i]
//         };
//       await coverageMap.set(coverageNames[i], coverages[i]);
//
//       // register pools in CoverRouter
//       claimAddr = await cover.claimCovToken();
//       noClaimAddr = await cover.noclaimCovToken();
//       await coverRouter.setPoolForPair(claimAddr, pairedTokenAddr[i], claimPools[i]);
//       await coverRouter.setPoolForPair(noClaimAddr, pairedTokenAddr[i], noClaimPools[i]);
//     }
//
//     // // check mapping
//     // for (var [key, value] of coverageMap.entries()) {
//     //   console.log(" ### "+key+" ###")
//     //   console.log(value);
//     //   console.log("=======================")
//     // }
//   });
// });

// describe("### GET POOL STATS", function() {
//   it("Get Amount of CLAIM Tokens in BPool", async function() {
//     const [claimPool, noclaimPool, claimTokenAddr, noclaimTokenAddr] = await getCovPools("CURVE");
//     const claimToken = await ethers.getContractAt("IERC20", claimTokenAddr);
//
//     const amountClaimMinted = await claimToken.totalSupply();
//     const amountClaimInPool = await claimPool.getBalance(claimTokenAddr);
//     const amountCollateralInPool = await claimPool.getBalance(coverageMap.get("CURVE").collateralAddr);
//     const amountClaimNotInPool = amountClaimMinted.sub(amountClaimInPool);
//
//     console.log("Amount of CLAIM minted: " + ethers.utils.formatEther(amountClaimMinted).toString());
//     console.log("Amount of CLAIM in BPool: " + ethers.utils.formatEther(amountClaimInPool).toString());
//     console.log("Amount of DAI in BPool: " + ethers.utils.formatEther(amountCollateralInPool).toString())
//     console.log("Amount of CLAIM not in pool: " + ethers.utils.formatEther(amountClaimNotInPool).toString());
//   });

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
// });

describe("### CALC TOOL", function() {
  it("CP: Calculate earned Premium", async function() {

    // ##################################################################
    // ONLY FOR CP, selling the minted CLAIM tokens after minting
    // ##################################################################

    // COVER API DATA
    const swapFee = 0.01; // CLAIM pool

    const denormWeightClaim = 40;
    const denormWeightDai = 10;

    const balanceClaim = 2144998;
    const balanceDai = 91400;

    // INPUT DATA
    const mintAmount = 10000;

    // PREMIUM CALC
    const premium = balanceDai * (1 - (balanceClaim / (balanceClaim + mintAmount * (1 - swapFee))) ** (denormWeightClaim / denormWeightDai));

    console.log("Earned Premium: "+premium);
  });

  it("MM & HACK: Swap Fees and Impermanent Loss", async function() {

    // #################################
    // CLAIM POOL
    // #################################

    // COVER API DATA
    let swapFee = 0.01;

    let denormWeightClaim = 40;
    let denormWeightDai = 10;

    let balanceClaim = 2144998;
    let balanceDai = 91400;

    let priceClaimToken = 0.17;

    // INPUT DATA
    let targetEndPrice = 1;
    let mintAmount = 10000;

    // CALC SWAP FEEs
    let normalizedWeightClaim = ((100 / (denormWeightClaim + denormWeightDai)) * denormWeightClaim) / 100;
    let slippagePerDai = (1 - swapFee)/(2 * balanceDai * normalizedWeightClaim);
    let daiSpent = ((targetEndPrice / priceClaimToken) - 1) / slippagePerDai;

    let earnedSwapFeesClaim = daiSpent * swapFee;

    // CALC IMPERMANENT LOSS
    let claimPriceChange = ((targetEndPrice * 100) / priceClaimToken) / 100;
    let poolValue = (claimPriceChange * normalizedWeightClaim) + (1 - normalizedWeightClaim);
    let assetValueIfHeld = (claimPriceChange ** normalizedWeightClaim) * (1 ** (1-normalizedWeightClaim));

    let impermanenLossClaim = Math.abs(assetValueIfHeld / poolValue - 1);

    // console.log("MM_CLAIMPOOL_HACK - SwapFees: "+earnedSwapFeesClaim);
    // console.log("MM_CLAIMPOOL_HACK - Impermanent Loss: "+impermanenLossClaim);

    // #################################
    // NOCLAIM POOL
    // #################################

    // COVER API DATA
    swapFee = 0.01;

    let denormWeightNolaim = 49;
    denormWeightDai = 1;

    let balanceNoclaim = 2144274;
    balanceDai = 56709;

    let priceNoclaimToken = 0.92;

    // INPUT DATA
    targetEndPrice = 0.03;

    // CALC SWAP Fees
    let normalizedWeightDai = ((100 / (denormWeightNolaim + denormWeightDai)) * denormWeightDai) / 100;
    let slippagePerNoClaim = (1 - swapFee)/(2 * balanceNoclaim * normalizedWeightDai);
    let noclaimSpent = (1-(targetEndPrice - priceNoclaimToken) / targetEndPrice) / slippagePerNoClaim;

    earnedSwapFeesNoClaim = noclaimSpent * targetEndPrice * swapFee;

    // CALC IMPERMANENT LOSS
    let noclaimPriceChange = ((targetEndPrice * 100) / priceNoclaimToken) / 100;
    poolValue = (noclaimPriceChange * (100 - normalizedWeightDai*100)/100) + normalizedWeightDai;
    assetValueIfHeld = (noclaimPriceChange ** (1-normalizedWeightDai)) * (1 ** normalizedWeightDai);

    impermanenLossNoClaim = Math.abs(assetValueIfHeld / poolValue - 1);

    //console.log("noclaimSpent: "+noclaimSpent+" - poolValue: "+poolValue+" - assetValueIfHeld: "+assetValueIfHeld)

    // console.log("MM_NOCLAIMPOOL_HACK - SwapFees: "+earnedSwapFeesNoClaim);
    // console.log("MM_NOCLAIMPOOL_HACK - Impermanent Loss: "+impermanenLossNoClaim);


    // TOTAL
    const totalIL = impermanenLossClaim + impermanenLossNoClaim;
    const il = totalIL * mintAmount;

    const totalSF = earnedSwapFeesClaim + earnedSwapFeesNoClaim;
    console.log("MM_HACK total Swap Fees: "+totalSF);
    console.log("MM_HACK total Impermanent Loss: "+il);
  });

  it("MM & NO HACK: Swap Fees and Impermanent Loss", async function() {

    // #################################
    // CLAIM POOL
    // #################################

    // COVER API DATA
    let swapFee = 0.01;

    let denormWeightClaim = 40;
    let denormWeightDai = 10;

    let balanceClaim = 2144998;
    let balanceDai = 91400;

    let priceClaimToken = 0.17;

    // INPUT DATA
    let targetEndPrice = 0.03;
    let mintAmount = 10000;

    // CALC SWAP FEEs
    let normalizedWeightDai = ((100 / (denormWeightClaim + denormWeightDai)) * denormWeightDai) / 100;
    let slippagePerClaim = (1 - swapFee)/(2 * balanceClaim * normalizedWeightDai);
    let claimSpent = (1-(targetEndPrice - priceClaimToken) / targetEndPrice) / slippagePerClaim;

    let earnedSwapFeesClaim = claimSpent * targetEndPrice * swapFee;

    // CALC IMPERMANENT LOSS
    let claimPriceChange = ((targetEndPrice * 100) / priceClaimToken) / 100;
    let poolValue = (claimPriceChange * (100 - normalizedWeightDai*100)/100) + normalizedWeightDai;
    let assetValueIfHeld = (claimPriceChange ** (1-normalizedWeightDai)) * (1 ** normalizedWeightDai);

    let impermanenLossClaim = Math.abs(assetValueIfHeld / poolValue - 1);

    // console.log("MM_CLAIMPOOL_NOHACK - SwapFees: "+earnedSwapFeesClaim);
    // console.log("MM_CLAIMPOOL_NOHACK - Impermanent Loss: "+impermanenLossClaim);

    // #################################
    // NOCLAIM POOL
    // #################################

    // COVER API DATA
    swapFee = 0.01;

    let denormWeightNolaim = 49;
    denormWeightDai = 1;

    let balanceNoclaim = 2144998;
    balanceDai = 91400;

    let priceNoclaimToken = 0.87;

    // INPUT DATA
    targetEndPrice = 1;

    // CALC SWAP Fees
    let normalizedWeighNoClaim = ((100 / (denormWeightNolaim + denormWeightDai)) * denormWeightNolaim) / 100;
    let slippagePerDai = (1 - swapFee)/(2 * balanceDai * normalizedWeighNoClaim);
    let daiSpent = ((targetEndPrice / priceNoclaimToken) - 1) / slippagePerDai;

    earnedSwapFeesNoClaim = daiSpent * swapFee;

    // CALC IMPERMANENT LOSS
    let noclaimPriceChange = ((targetEndPrice * 100) / priceNoclaimToken) / 100;
    poolValue = (noclaimPriceChange * normalizedWeighNoClaim) + (1 - normalizedWeighNoClaim);
    assetValueIfHeld = (noclaimPriceChange ** normalizedWeighNoClaim) * (1 ** (1-normalizedWeighNoClaim));

    impermanenLossNoClaim = Math.abs(assetValueIfHeld / poolValue - 1);

    // console.log("noclaimPriceChange: "+noclaimPriceChange+" - poolValue: "+poolValue+" - assetValueIfHeld: "+assetValueIfHeld)
    //
    // console.log("MM_NOCLAIMPOOL_NOHACK - SwapFees: "+earnedSwapFeesNoClaim);
    // console.log("MM_NOCLAIMPOOL_NOHACK - Impermanent Loss: "+impermanenLossNoClaim);


    // TOTAL
    const totalIL = impermanenLossClaim + impermanenLossNoClaim;
    const il = totalIL * mintAmount;

    const totalSF = earnedSwapFeesClaim + earnedSwapFeesNoClaim;
    console.log("MM_NOHACK total Swap Fees: "+totalSF);
    console.log("MM_NOHACK total Impermanent Loss: "+il);
  });

  it("CP & HACK: Swap Fees and Impermanent Loss", async function() {

    // #################################
    // NOCLAIM POOL
    // #################################

    // COVER API DATA
    let swapFee = 0.01;

    let denormWeightNolaim = 49;
    let denormWeightDai = 1;

    let balanceNoclaim = 2144274;
    let balanceDai = 56709;

    let priceNoclaimToken = 0.92;

    // INPUT DATA
    let targetEndPrice = 0.03;
    let mintAmount = 10000;

    // CALC SWAP Fees
    let normalizedWeightDai = ((100 / (denormWeightNolaim + denormWeightDai)) * denormWeightDai) / 100;
    let slippagePerNoClaim = (1 - swapFee)/(2 * balanceNoclaim * normalizedWeightDai);
    let noclaimSpent = (1-(targetEndPrice - priceNoclaimToken) / targetEndPrice) / slippagePerNoClaim;

    let earnedSwapFees = noclaimSpent * targetEndPrice * swapFee;

    // CALC IMPERMANENT LOSS
    let noclaimPriceChange = ((targetEndPrice * 100) / priceNoclaimToken) / 100;
    let poolValue = (noclaimPriceChange * (100 - normalizedWeightDai*100)/100) + normalizedWeightDai;
    let assetValueIfHeld = (noclaimPriceChange ** (1-normalizedWeightDai)) * (1 ** normalizedWeightDai);

    let impermanenLoss = Math.abs(assetValueIfHeld / poolValue - 1);
    let il = impermanenLoss * mintAmount;

    console.log("CP_HACK total Swap Fees: "+earnedSwapFees);
    console.log("CP_HACK total Impermanent Loss: "+il);
  });

  it("CP & NO HACK: Swap Fees and Impermanent Loss", async function() {

    // #################################
    // NOCLAIM POOL
    // #################################

    // COVER API DATA
    let swapFee = 0.01;

    let denormWeightNolaim = 49;
    let denormWeightDai = 1;

    let balanceNoclaim = 2144998;
    let balanceDai = 91400;

    let priceNoclaimToken = 0.87;

    // INPUT DATA
    let targetEndPrice = 1;
    let mintAmount = 10000;

    // CALC SWAP Fees
    let normalizedWeighNoClaim = ((100 / (denormWeightNolaim + denormWeightDai)) * denormWeightNolaim) / 100;
    let slippagePerDai = (1 - swapFee)/(2 * balanceDai * normalizedWeighNoClaim);
    let daiSpent = ((targetEndPrice / priceNoclaimToken) - 1) / slippagePerDai;

    let earnedSwapFees = daiSpent * swapFee;

    // CALC IMPERMANENT LOSS
    let noclaimPriceChange = ((targetEndPrice * 100) / priceNoclaimToken) / 100;
    let poolValue = (noclaimPriceChange * normalizedWeighNoClaim) + (1 - normalizedWeighNoClaim);
    let assetValueIfHeld = (noclaimPriceChange ** normalizedWeighNoClaim) * (1 ** (1-normalizedWeighNoClaim));

    let impermanenLoss = Math.abs(assetValueIfHeld / poolValue - 1);
    let il = impermanenLoss * mintAmount;

    console.log("CP_NOHACK - SwapFees: "+earnedSwapFees);
    console.log("CP_NOHACK - Impermanent Loss: "+il);
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

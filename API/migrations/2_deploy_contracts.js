const GreedIslandS1 = artifacts.require("GreedIslandS1");
const newBaseURI = "https:";
const _maxBasicCard = 12000;
const _maxACard = 6000;
const _maxSCard = 1000;
const _maxSSCard = 300;
const _maxXCard = 1;
const _sRatio = 3125;
const _ssRatio = 72222;
const _xRatio = 10000000;

module.exports = function (deployer) {
  deployer.deploy(
    GreedIslandS1,
    newBaseURI,
    _maxBasicCard,
    _maxACard,
    _maxSCard,
    _maxSSCard,
    _maxXCard,
    _sRatio,
    _ssRatio,
    _xRatio
  );
};

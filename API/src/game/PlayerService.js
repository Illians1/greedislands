const Moralis = require("moralis/node");
const UserService = require("../user/UserService");

const getPlayerLocation = async (id) => {
  const user = await UserService.getUser(id);
  const query = new Moralis.Query("PlayerLocation");
  query.equalTo("user", user[0]);
  const playerLocation = await query.find({ useMasterKey: true });
  return playerLocation;
};

const getPlayerInfos = async (id) => {
  const user = await UserService.getUser(id);
  const query = new Moralis.Query("Player");
  query.equalTo("user", user[0]);
  const player = await query.find({ useMasterKey: true });
  return player;
};

const updatePlayerLocation = async (id, previousMap, nextMap) => {
  const user = await UserService.getUser(id);
  const query = new Moralis.Query("PlayerLocation");
  query.equalTo("user", user[0]);
  const playerLocation = await query.first({ useMasterKey: true });
  playerLocation.set("previousMap", previousMap);
  playerLocation.set("actualMap", nextMap);
  return playerLocation.save();
};

module.exports = {
  getPlayerLocation,
  getPlayerInfos,
  updatePlayerLocation,
};

const Moralis = require("moralis/node");

const serverUrl = "https://zvgvvttxzfk4.usemoralis.com:2053/server";
const appId = "HcMlKE1WVlOvCBfizEAdsbdRpOEToYG2WTQg4Uz9";
const masterKey = "XEsYJj0UjjuBX3CtDrTLrZZCbTqWYRLJouRr464X";
Moralis.start({ serverUrl, appId, masterKey });

const getUser = async (id) => {
  const query = new Moralis.Query("_User");
  query.equalTo("objectId", id);
  const user = await query.find({ useMasterKey: true });
  return user;
};

const getSession = async (token) => {
  const query = new Moralis.Query("_Session");
  query.equalTo("sessionToken", token);
  const session = await query.find({ useMasterKey: true });
  return session;
};

const createPlayerLocation = async (id) => {
  const user = await getUser(id);
  const PlayerLocation = Moralis.Object.extend("PlayerLocation");
  const playerLocation = new PlayerLocation();
  playerLocation.set("user", user[0]);
  playerLocation.set("previousMap", "GoodStartValley");
  playerLocation.set("actualMap", "GoodStartValley");
  const now = new Date(Date.now());
  playerLocation.set("arrivedAt", now);
  playerLocation.save();
};

const createNewPlayer = async (id) => {
  const user = await getUser(id);
  const Player = Moralis.Object.extend("Player");
  const player = new Player();
  player.set("user", user[0]);
  player.set("goldenTicket", 0);
  player.set("platinumTicket", 0);
  player.set("diamondTicket", 0);
  player.set("teleportation", 0);
  player.set("lesserPotion", 0);
  player.set("greaterPotion", 0);
  player.set("divineSpeed", 0);
  player.set("treasureDetect", 0);
  player.save();
  console.log("createNewPlayer");
};

module.exports = {
  getUser,
  getSession,
  createPlayerLocation,
  createNewPlayer,
};

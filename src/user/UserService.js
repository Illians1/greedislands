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

const createPlayer = async (id) => {
  const user = await getUser(id);
  const Player = Moralis.Object.extend("Player");
  const player = new Player();
  player.set("user", user[0]);
  player.set("previousMap", "GoodStartValley");
  player.set("actualMap", "GoodStartValley");
  const now = new Date(Date.now());
  player.set("arrivedAt", now);
  player.save();
};

module.exports = {
  getUser,
  getSession,
  createPlayer,
};

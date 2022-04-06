const Moralis = require("moralis/node");
const UserService = require("../user/UserService");

const serverUrl = "https://zvgvvttxzfk4.usemoralis.com:2053/server";
const appId = "HcMlKE1WVlOvCBfizEAdsbdRpOEToYG2WTQg4Uz9";
const masterKey = "XEsYJj0UjjuBX3CtDrTLrZZCbTqWYRLJouRr464X";
Moralis.start({ serverUrl, appId, masterKey });

const getPlayerInfos = async (id) => {
  const user = await UserService.getUser(id);
  const query = new Moralis.Query("Player");
  query.equalTo("user", user[0]);
  const player = await query.find({ useMasterKey: true });
  return player;
};

module.exports = {
  getPlayerInfos,
};

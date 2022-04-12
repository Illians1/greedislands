const maps = require("../map/map.json");
const PlayerService = require("../game/PlayerService");
const UserService = require("../user/UserService");

const clickvalidation = async (req, res, next) => {
  const request = req.body;
  if (!request.mapname) {
    return res
      .status(400)
      .send({ ValidationErrors: "map name cannot be null" });
  }
  if (!request.x) {
    return res.status(400).send({ ValidationErrors: "x cannot be null" });
  }
  if (!request.y) {
    return res.status(400).send({ ValidationErrors: "y cannot be null" });
  }

  const places = maps.places;
  if (!places.hasOwnProperty(request.mapname)) {
    return res.status(404).send({ ValidationErrors: "this map doesn't exist" });
  }
  const playerLocation = await PlayerService.getPlayerLocation(request.userid);
  if (!playerLocation || playerLocation.length === 0) {
    await UserService.createPlayerLocation(request.userid);
  } else {
    const actualMap =
      playerLocation[playerLocation.length - 1].attributes.actualMap;
    if (actualMap !== request.mapname) {
      return res
        .status(403)
        .send({ ValidationErrors: "you're not on this map !" });
    }
    const arrivedAt =
      playerLocation[playerLocation.length - 1].attributes.arrivedAt;
    const now = new Date(Date.now());
    if (arrivedAt > now) {
      return res
        .status(403)
        .send({ ValidationErrors: "you're not arrived yet !" });
    }

    const player = await PlayerService.getPlayerInfos(request.userid);
    if (!player || player.length === 0) {
      await UserService.createNewPlayer(request.userid);
    }
  }
  next();
};

module.exports = clickvalidation;

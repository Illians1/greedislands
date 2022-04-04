const UserService = require("../user/UserService");
const maps = require("../map/map.json");

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
  if (!maps.hasOwnProperty(request.mapname)) {
    return res.status(404).send({ ValidationErrors: "this map doesn't exist" });
  }
  next();
};

module.exports = clickvalidation;

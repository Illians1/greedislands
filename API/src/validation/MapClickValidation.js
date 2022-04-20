const maps = require("../map/map.json");

const mapClickvalidation = async (req, res, next) => {
  const request = req.body;
  if (!request.nextMap) {
    return res
      .status(400)
      .send({ ValidationErrors: "next map cannot be null" });
  }

  const actualMapString = request.actualMap.toString();
  const nextMapString = request.nextMap.toString();

  const actualMapInfos = maps.places[actualMapString];
  const mapTravelTime = actualMapInfos["travel-time"][nextMapString];
  if (!mapTravelTime) {
    return res
      .status(403)
      .send({ ValidationErrors: "you can't travel to this place" });
  }

  next();
};

module.exports = mapClickvalidation;

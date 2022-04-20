const express = require("express");
const router = express.Router();
const gameClickvalidation = require("../validation/GameClickValidation");
const userValidation = require("../validation/userValidation");
const locationValidation = require("../validation/LocationValidation");
const mapClickValidation = require("../validation/MapClickValidation");
const gameClickRouter = require("./GameClickRouter");
const PlayerService = require("../game/PlayerService");
const Moralis = require("moralis/node");
const maps = require("../map/map.json");

const { serverUrl, appId, masterKey } = require("../moralisConnect");
Moralis.start({ serverUrl, appId, masterKey });

router.post(
  "/api/1.0/gameclick",
  userValidation,
  gameClickvalidation,
  locationValidation,
  (req, res) => {
    const request = req.body;
    const gameClickHandler = gameClickRouter(
      request.actualMap,
      request.x,
      request.y
    );
    if (gameClickHandler.ValidationErrors) {
      return res
        .status(gameClickHandler.status)
        .send({ ValidationErrors: gameClickHandler.ValidationErrors });
    } else {
      return res.status(200).send({ actualMap: request.actualMap });
    }
  }
);

router.post(
  "/api/1.0/mapclick",
  userValidation,
  locationValidation,
  mapClickValidation,
  async (req, res) => {
    const request = req.body;
    const actualMapString = request.actualMap.toString();
    const nextMapString = request.nextMap.toString();

    const actualMapInfos = maps.places[actualMapString];
    const mapTravelTime = actualMapInfos["travel-time"][nextMapString];
    const baseTravelTime = maps.travelTime;

    const now = new Date(Date.now());
    const arrivedAt = new Date(
      now.getTime() + baseTravelTime * mapTravelTime * 1000
    );

    await PlayerService.updatePlayerLocation(
      request.userid,
      request.actualMap,
      request.nextMap
    );

    return res.status(200).send({
      previousMap: request.actualMap,
      actualMap: request.nextMap,
      arrivedAt,
    });
  }
);

module.exports = router;

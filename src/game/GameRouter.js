const express = require("express");
const router = express.Router();
const clickvalidation = require("../validation/clickValidation");
const userValidation = require("../validation/userValidation");
const clickmapRouter = require("./ClickmapMethod");

router.post(
  "/api/1.0/gameclick",
  userValidation,
  clickvalidation,
  clickmapRouter,
  (req, res) => {
    const request = req.body;
    return res
      .status(200)
      .send({ mapname: request.mapname, x: request.x, y: request.y });
  }
);

module.exports = router;

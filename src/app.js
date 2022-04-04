const express = require("express");
const GameRouter = require("./game/GameRouter");

const app = express();

app.use(express.json({ limit: "3mb" }));

app.use(GameRouter);

module.exports = app;

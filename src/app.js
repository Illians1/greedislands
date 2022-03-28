const express = require("express");
const UserRouter = require("./user/UserRouter");

const app = express();

app.use(express.json({ limit: "3mb" }));

app.use(UserRouter);

module.exports = app;

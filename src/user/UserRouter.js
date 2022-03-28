const express = require("express");
const router = express.Router();
const UserService = require("./UserService");

router.post("/api/1.0/click", async (req, res) => {
  const user = await UserService.getUser(req.body.userid);
  const session = await UserService.getSession(req.body.usersessiontoken);
  if (!user.length || user.length > 1) {
    return res.status(404).send({ message: "Error from userId" });
  }
  if (!session.length || session.length > 1) {
    return res.status(404).send({ message: "Error from session token" });
  }
  const ownerOfSession = session[0].attributes.user;
  if (ownerOfSession.id !== user[0].id) {
    return res
      .status(403)
      .send({ message: "Session doesn't correspond to the user" });
  }
  return res.status(200).send({ message: "Request valid" });
});

module.exports = router;

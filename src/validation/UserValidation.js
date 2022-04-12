const UserService = require("../user/UserService");

const userValidation = async (req, res, next) => {
  const request = req.body;
  if (!request.userid) {
    return res.status(400).send({ ValidationErrors: "user id cannot be null" });
  }
  if (!request.usersessiontoken) {
    return res
      .status(400)
      .send({ ValidationErrors: "user's session token cannot be null" });
  }
  if (!request.ethAddress) {
    return res
      .status(400)
      .send({ ValidationErrors: "user's address cannot be null" });
  }

  const user = await UserService.getUser(request.userid);
  if (user.length === 0 || user.length > 1) {
    return res.status(404).send({ ValidationErrors: "error from userId" });
  }
  if (user[0].attributes.ethAddress !== request.ethAddress) {
    return res.status(403).send({ ValidationErrors: "error from eth address" });
  }

  const session = await UserService.getSession(request.usersessiontoken);
  if (!session.length || session.length > 1) {
    return res
      .status(403)
      .send({ ValidationErrors: "error from session token" });
  }
  const ownerOfSession = session[0].attributes.user;
  if (ownerOfSession.id !== user[0].id) {
    return res
      .status(403)
      .send({ ValidationErrors: "session doesn't correspond to the user" });
  }
  next();
};

module.exports = userValidation;

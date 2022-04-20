const gameClickvalidation = async (req, res, next) => {
  const request = req.body;

  if (!request.x) {
    return res.status(400).send({ ValidationErrors: "x cannot be null" });
  }
  if (!request.y) {
    return res.status(400).send({ ValidationErrors: "y cannot be null" });
  }

  next();
};

module.exports = gameClickvalidation;

const clickmapRouter = async (req, res, next) => {
  const request = req.body;
  const methodname = request.mapname.toString();
  if (methods.hasOwnProperty(request.mapname)) {
    await methods[methodname](request.x, request.y);
  }
  next();
};

const methods = {
  Wardena: (x, y) => {
    return "error";
  },
  Bayville: (x, y) => {
    return "error";
  },
};

module.exports = clickmapRouter;

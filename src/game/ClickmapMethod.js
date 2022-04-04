const clickmapRouter = (req, res, next) => {
  const request = req.body;
  const methodname = request.mapname.toString();
  const methodCalled = methods[methodname](request.x, request.y);
  next();
};

const methods = {
  GoodStartValley: (x, y) => {
    return "error";
  },
};

module.exports = clickmapRouter;

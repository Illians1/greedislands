const gameClickRouter = async (actualMap, x, y) => {
  if (actualMap) {
    const methodname = actualMap.toString();
  }

  if (methods.hasOwnProperty(actualMap)) {
    methods[methodname](x, y);
  } else {
    return { status: 404, ValidationErrors: "this map doesn't exist" };
  }
};

const methods = {
  Wardena: (x, y) => {
    return "error";
  },
  Bayville: (x, y) => {
    return "error";
  },
};

module.exports = gameClickRouter;

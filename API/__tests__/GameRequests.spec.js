const request = require("supertest");
const app = require("../src/app");
const Moralis = require("moralis/node");
const ethers = Moralis.web3Library;

const { serverUrl, appId, masterKey } = require("../src/moralisConnect");
Moralis.start({ serverUrl, appId, masterKey });

const url = "http://localhost:8545";

const provider = new ethers.providers.JsonRpcProvider(url);
const signer0 = provider.getSigner(0);
const signer1 = provider.getSigner(1);
const privateKey0 =
  "0x31c354f57fc542eba2c56699286723e94f7bd02a4891a0a7f68566c2a2df6001";
const privateKey1 =
  "0x31c354f57fc542eba2c56699286723e94f7bd02a4891a0a7f68566c2a2df6002";

const clickUser = async (user, options = {}) => {
  const agent = request(app).post("/api/1.0/gameclick");
  if (options.language) {
    agent.set("Accept-Language", options.language);
  }
  const userid = user.id;
  const session = user.attributes.sessionToken;
  const ethAddress = await signer1.getAddress();
  let req = {
    actualMap: "Wardena",
    x: 68,
    y: 86,
    userid,
    usersessiontoken: session,
    ethAddress,
  };
  if (options) {
    Object.keys(options).forEach((key) => {
      if (options[key] === "empty") {
        req[key] = "";
      } else if (options[key]) {
        req[key] = options[key];
      }
    });
  }
  return agent.send(req);
};

const createUser = async (userinfos) => {
  const user = new Moralis.User();
  user.set("username", userinfos.username);
  user.set("password", userinfos.password);
  user.set("email", userinfos.email);
  user.set("ethAddress", userinfos.ethAddress);
  try {
    const signup = await user.signUp();
    return signup;
  } catch (error) {
    return {
      errorcode: error.code,
      errormessage: error.message,
    };
  }
};

const createPlayerLocation = async (options = {}) => {
  const user = await Moralis.User.logIn("abcd", "efgh");
  const PlayerLocation = Moralis.Object.extend("PlayerLocation");
  const playerLocation = new PlayerLocation();
  let req = {
    user,
    previousMap: "GoodStartValley",
    actualMap: "Wardena",
    arrivedAt: new Date(Date.now()),
  };
  if (options) {
    Object.keys(options).forEach((key) => {
      if (options[key] === "empty") {
        req[key] = "";
      } else if (options[key]) {
        req[key] = options[key];
      }
    });
  }
  playerLocation.set("user", req.user);
  playerLocation.set("previousMap", req.previousMap);
  playerLocation.set("actualMap", req.actualMap);
  playerLocation.set("arrivedAt", req.arrivedAt);
  playerLocation.save();
};

const getPlayerLocation = async (user) => {
  const query = new Moralis.Query("PlayerLocation");
  query.equalTo("user", user);
  const playerLocation = await query.find({ useMasterKey: true });
  return playerLocation;
};

const getPlayerInfos = async (user) => {
  const query = new Moralis.Query("Player");
  query.equalTo("user", user);
  const player = await query.find({ useMasterKey: true });
  return player;
};

const destroyPlayers = async () => {
  // Player
  query = new Moralis.Query("Player");
  const players = await query.find({ useMasterKey: true });
  for (const player of players) {
    await player.destroy({ useMasterKey: true });
  }
};

const destroyPlayerLocations = async () => {
  // Player location
  const query = new Moralis.Query("PlayerLocation");
  const playerLocations = await query.find({ useMasterKey: true });
  let promiseToDestroy = [];
  for (let playerLocation of playerLocations) {
    const promise = playerLocation.destroy({ useMasterKey: true });
    promiseToDestroy.push(promise);
  }
  await Promise.all(promiseToDestroy);
};

const destroyUserAndSessions = async (user) => {
  //Destroy User
  await user.destroy({ useMasterKey: true });
  // Destroy Session
  const query = new Moralis.Query("_Session");
  sessions = await query.find({ useMasterKey: true });
  for (const session of sessions) {
    if (session.attributes.sessionToken != "r:7adc2762ffc91d859a3664e3f8136546")
      await session.destroy({ useMasterKey: true });
  }
};

beforeAll(async () => {
  const ethAddress = await signer1.getAddress();
  await createUser({
    username: "abcd",
    password: "efgh",
    email: "mail@mail",
    ethAddress,
  });
  await createPlayerLocation();
});

afterAll(async () => {
  const user = await Moralis.User.logIn("abcd", "efgh");
  await destroyUserAndSessions(user);
  await destroyPlayers();
  await destroyPlayerLocations();
});

describe("user request", () => {
  it("returns an error when userId is null", async () => {
    const user = await Moralis.User.logIn("abcd", "efgh");
    const response = await clickUser(user, { userid: "empty" });
    expect(response.status).toBe(400);
    expect(response.body.ValidationErrors).toBe("user id cannot be null");
  });
  it("returns an error when session token is null", async () => {
    const user = await Moralis.User.logIn("abcd", "efgh");
    const response = await clickUser(user, { usersessiontoken: "empty" });
    expect(response.status).toBe(400);
    expect(response.body.ValidationErrors).toBe(
      "user's session token cannot be null"
    );
  });
  it("returns an error when address is null", async () => {
    const user = await Moralis.User.logIn("abcd", "efgh");
    const response = await clickUser(user, { ethAddress: "empty" });
    expect(response.status).toBe(400);
    expect(response.body.ValidationErrors).toBe(
      "user's address cannot be null"
    );
  });
  it("returns an error when userId is false", async () => {
    const user = await Moralis.User.logIn("abcd", "efgh");
    const response = await clickUser(user, { userid: "abc" });
    expect(response.status).toBe(404);
    expect(response.body.ValidationErrors).toBe("error from userId");
  });
  it("returns an error when session token is false", async () => {
    const user = await Moralis.User.logIn("abcd", "efgh");
    const response = await clickUser(user, { usersessiontoken: "abc" });
    expect(response.status).toBe(403);
    expect(response.body.ValidationErrors).toBe("error from session token");
  });
  it("returns an error when session doesn't correspond to the user", async () => {
    const user = await Moralis.User.logIn("abcd", "efgh");
    const response = await clickUser(user, {
      usersessiontoken: "r:7adc2762ffc91d859a3664e3f8136546",
    });
    expect(response.status).toBe(403);
    expect(response.body.ValidationErrors).toBe(
      "session doesn't correspond to the user"
    );
  });
  it("returns an error when ethAddress is false", async () => {
    const user = await Moralis.User.logIn("abcd", "efgh");
    const response = await clickUser(user, {
      ethAddress: "0x0000000000000000000000000000000000000002",
    });
    expect(response.status).toBe(403);
    expect(response.body.ValidationErrors).toBe("error from eth address");
  });
  /*   it("create a new player location if nothing exists", async () => {
    await destroyPlayerLocations();
    const user = await Moralis.User.logIn("abcd", "efgh");
    const response = await clickUser(user);
    expect(response.status).toBe(200);
    const playerLocation = await getPlayerLocation(user);
    expect(playerLocation.length).not.toBe(0);
    await createPlayerLocation();
  });
  it("create a new player if it doesn't exist", async () => {
    await destroyPlayers();
    const user = await Moralis.User.logIn("abcd", "efgh");
    const response = await clickUser(user);
    expect(response.status).toBe(200);
    const playerInfos = await getPlayerInfos(user);
    expect(playerInfos.length).not.toBe(0);
  }); */
});

describe("gameclick request", () => {
  it("returns actualMap when request is valid", async () => {
    const user = await Moralis.User.logIn("abcd", "efgh");
    const response = await clickUser(user);
    expect(response.status).toBe(200);
    expect(response.body.actualMap).toBe("Wardena");
  });
  it("returns an error when actualMap is null", async () => {
    const user = await Moralis.User.logIn("abcd", "efgh");
    const response = await clickUser(user, { actualMap: "empty" });
    expect(response.status).toBe(400);
    expect(response.body.ValidationErrors).toBe("map name cannot be null");
  });
  it("returns an error when x is null", async () => {
    const user = await Moralis.User.logIn("abcd", "efgh");
    const response = await clickUser(user, { x: "empty" });
    expect(response.status).toBe(400);
    expect(response.body.ValidationErrors).toBe("x cannot be null");
  });
  it("returns an error when y is null", async () => {
    const user = await Moralis.User.logIn("abcd", "efgh");
    const response = await clickUser(user, { y: "empty" });
    expect(response.status).toBe(400);
    expect(response.body.ValidationErrors).toBe("y cannot be null");
  });
  it("returns an error when the map doesn't exist", async () => {
    const user = await Moralis.User.logIn("abcd", "efgh");
    const response = await clickUser(user, { actualMap: "wrong map" });
    expect(response.status).toBe(404);
    expect(response.body.ValidationErrors).toBe("this map doesn't exist");
  });
  it("returns an error when the map doesn't correspond to actual map in database", async () => {
    const user = await Moralis.User.logIn("abcd", "efgh");
    const response = await clickUser(user, { actualMap: "Bayville" });
    expect(response.status).toBe(403);
    expect(response.body.ValidationErrors).toBe("you're not on this map !");
  });
  it("returns an error if the map only correspond to an older record", async () => {
    await destroyPlayerLocations();
    await createPlayerLocation({ actualMap: "Bayville" });
    const user = await Moralis.User.logIn("abcd", "efgh");
    const response = await clickUser(user);
    expect(response.status).toBe(403);
    expect(response.body.ValidationErrors).toBe("you're not on this map !");
    await destroyPlayerLocations();
    await createPlayerLocation();
  });
  it("returns an error if player isn't arrived yet", async () => {
    await destroyPlayerLocations();
    let date = new Date(Date.now());
    date = new Date(date.getTime() + 30 * 60000);
    await createPlayerLocation({ arrivedAt: date });
    const user = await Moralis.User.logIn("abcd", "efgh");
    const response = await clickUser(user);
    expect(response.status).toBe(403);
    expect(response.body.ValidationErrors).toBe("you're not arrived yet !");
    await destroyPlayerLocations();
    await createPlayerLocation();
  });
});

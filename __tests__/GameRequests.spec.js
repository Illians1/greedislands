const request = require("supertest");
const app = require("../src/app");
const Moralis = require("moralis/node");

const serverUrl = "https://zvgvvttxzfk4.usemoralis.com:2053/server";
const appId = "HcMlKE1WVlOvCBfizEAdsbdRpOEToYG2WTQg4Uz9";
const masterKey = "XEsYJj0UjjuBX3CtDrTLrZZCbTqWYRLJouRr464X";
Moralis.start({ serverUrl, appId, masterKey });

const clickUser = (user, options = {}) => {
  const agent = request(app).post("/api/1.0/gameclick");
  if (options.language) {
    agent.set("Accept-Language", options.language);
  }
  const userid = user.id;
  const session = user.attributes.sessionToken;
  let req = {
    mapname: "Wardena",
    x: 68,
    y: 86,
    userid: userid,
    usersessiontoken: session,
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

const createPlayer = async (options = {}) => {
  const user = await Moralis.User.logIn("abcd", "efgh");
  const Player = Moralis.Object.extend("Player");
  const player = new Player();
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
  player.set("user", req.user);
  player.set("previousMap", req.previousMap);
  player.set("actualMap", req.actualMap);
  player.set("arrivedAt", req.arrivedAt);
  player.save();
};

const destroyPlayers = async () => {
  const query = new Moralis.Query("Player");
  players = await query.find({ useMasterKey: true });
  for (const player of players) {
    await player.destroy({ useMasterKey: true });
  }
};

const destroyUserAndSessions = async (user) => {
  //Destroy User
  await user.destroy({ useMasterKey: true });
  // Destroy Session
  const query = new Moralis.Query("_Session");
  sessions = await query.find({ useMasterKey: true });
  for (const session of sessions) {
    if (session.attributes.sessionToken != "r:da460a85a47f138653b9a900ca0a3e7e")
      await session.destroy({ useMasterKey: true });
  }
};

beforeAll(async () => {
  await createUser({
    username: "abcd",
    password: "efgh",
    email: "mail@mail",
  });
  await createPlayer();
});

afterAll(async () => {
  const user = await Moralis.User.logIn("abcd", "efgh");
  await destroyUserAndSessions(user);
  await destroyPlayers();
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
  it("returns an error when userId is false", async () => {
    const user = await Moralis.User.logIn("abcd", "efgh");
    const response = await clickUser(user, { userid: "abc" });
    expect(response.status).toBe(404);
    expect(response.body.ValidationErrors).toBe("error from userId");
  });
  it("returns an error when session token is false", async () => {
    const user = await Moralis.User.logIn("abcd", "efgh");
    const response = await clickUser(user, { usersessiontoken: "abc" });
    expect(response.status).toBe(404);
    expect(response.body.ValidationErrors).toBe("error from session token");
  });
  it("returns an error when session doesn't correspond to the user", async () => {
    const user = await Moralis.User.logIn("abcd", "efgh");
    const response = await clickUser(user, {
      usersessiontoken: "r:da460a85a47f138653b9a900ca0a3e7e",
    });
    expect(response.status).toBe(403);
    expect(response.body.ValidationErrors).toBe(
      "session doesn't correspond to the user"
    );
  });
});

describe("gameclick request", () => {
  it("returns x, y and mapname when request is valid", async () => {
    const user = await Moralis.User.logIn("abcd", "efgh");
    const response = await clickUser(user);
    expect(response.status).toBe(200);
    expect(response.body.mapname).toBe("Wardena");
    expect(response.body.x).toBe(68);
    expect(response.body.y).toBe(86);
  });
  it("returns an error when mapname is null", async () => {
    const user = await Moralis.User.logIn("abcd", "efgh");
    const response = await clickUser(user, { mapname: "empty" });
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
    const response = await clickUser(user, { mapname: "wrong map" });
    expect(response.status).toBe(404);
    expect(response.body.ValidationErrors).toBe("this map doesn't exist");
  });
  it("returns an error when the map doesn't correspond to actual map in database", async () => {
    const user = await Moralis.User.logIn("abcd", "efgh");
    const response = await clickUser(user, { mapname: "Bayville" });
    expect(response.status).toBe(403);
    expect(response.body.ValidationErrors).toBe("you're not on this map !");
  });
  it("returns an error if the map only correspond to an older record", async () => {
    await createPlayer({ actualMap: "Bayville" });
    const user = await Moralis.User.logIn("abcd", "efgh");
    const response = await clickUser(user);
    expect(response.status).toBe(403);
    expect(response.body.ValidationErrors).toBe("you're not on this map !");
  });
  it("returns an error if player isn't arrived yet", async () => {
    let date = new Date(Date.now());
    date = new Date(date.getTime() + 30 * 60000);
    await createPlayer({ time: date });
    const user = await Moralis.User.logIn("abcd", "efgh");
    const response = await clickUser(user);
    expect(response.status).toBe(403);
    expect(response.body.ValidationErrors).toBe("you're not arrived yet");
  });
});

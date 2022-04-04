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
    mapname: "GoodStartValley",
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
});

afterAll(async () => {
  const user = await Moralis.User.logIn("abcd", "efgh");
  await destroyUserAndSessions(user);
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
    expect(response.body.message).toBe("Error from userId");
  });
  it("returns an error when session token is false", async () => {
    const user = await Moralis.User.logIn("abcd", "efgh");
    const response = await clickUser(user, { usersessiontoken: "abc" });
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Error from session token");
  });
  it("returns an error when session doesn't correspond to the user", async () => {
    const user = await Moralis.User.logIn("abcd", "efgh");
    const response = await clickUser(user, {
      usersessiontoken: "r:da460a85a47f138653b9a900ca0a3e7e",
    });
    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "Session doesn't correspond to the user"
    );
  });
});

describe("clickmap request", () => {
  it("returns 200 OK when request is valid", async () => {
    const user = await Moralis.User.logIn("abcd", "efgh");
    const response = await clickUser(user);
    expect(response.status).toBe(200);
  });
  it("returns x, y and mapname when request is valid", async () => {
    const user = await Moralis.User.logIn("abcd", "efgh");
    const response = await clickUser(user);
    expect(response.status).toBe(200);
    expect(response.body.mapname).toBe("GoodStartValley");
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
});

const request = require("supertest");
const app = require("../src/app");
const Moralis = require("moralis/node");

const serverUrl = "https://zvgvvttxzfk4.usemoralis.com:2053/server";
const appId = "HcMlKE1WVlOvCBfizEAdsbdRpOEToYG2WTQg4Uz9";
const masterKey = "XEsYJj0UjjuBX3CtDrTLrZZCbTqWYRLJouRr464X";
Moralis.start({ serverUrl, appId, masterKey });

const clickUser = (user, options = {}) => {
  const agent = request(app).post("/api/1.0/click");
  if (options.language) {
    agent.set("Accept-Language", options.language);
  }
  const userid = user.id;
  const session = user.attributes.sessionToken;
  let req = {
    mapname: "Starting land",
    x: 68,
    y: 86,
    userid: userid,
    usersessiontoken: session,
  };
  if (options.falseUserId) {
    req.userid = options.falseUserId;
  }
  if (options.falseSessionToken) {
    req.usersessiontoken = options.falseSessionToken;
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
  it("returns 200 OK when request is valid", async () => {
    const user = await Moralis.User.logIn("abcd", "efgh");
    const response = await clickUser(user);
    expect(response.status).toBe(200);
  });

  it("returns a body message when request is valid", async () => {
    const user = await Moralis.User.logIn("abcd", "efgh");
    const response = await clickUser(user);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Request valid");
  });
  it("returns an error when userId is false", async () => {
    const user = await Moralis.User.logIn("abcd", "efgh");
    const response = await clickUser(user, { falseUserId: "abc" });
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Error from userId");
  });
  it("returns an error when session token is false", async () => {
    const user = await Moralis.User.logIn("abcd", "efgh");
    const response = await clickUser(user, { falseSessionToken: "abc" });
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Error from session token");
  });
  it("returns an error when session doesn't correspond to the user", async () => {
    const user = await Moralis.User.logIn("abcd", "efgh");
    const response = await clickUser(user, {
      falseSessionToken: "r:da460a85a47f138653b9a900ca0a3e7e",
    });
    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "Session doesn't correspond to the user"
    );
  });
});

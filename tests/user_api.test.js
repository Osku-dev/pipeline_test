const assert = require("assert");
const { test, describe, before, after, beforeEach } = require("node:test");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const User = require("../models/user");

const api = supertest(app);

beforeEach(async () => {
  await User.deleteMany({});
});

describe("POST /api/users", () => {
  test("should not allow creating a user with a short username", async () => {
    const newUser = {
      username: "ab", // too short
      name: "Test User",
      password: "validpassword",
    };

    const response = await api
      .post("/api/users")
      .send(newUser)
      .expect(400) // Bad Request
      .expect("Content-Type", /application\/json/);

    assert.strictEqual(
      response.body.error,
      "User validation failed: username: Path `username` (`ab`) is shorter than the minimum allowed length (3)."
    );
  });

  test("should not allow creating a user with a missing username", async () => {
    const newUser = {
      username: "", // missing username
      name: "Test User",
      password: "validpassword",
    };

    const response = await api
      .post("/api/users")
      .send(newUser)
      .expect(400) // Bad Request
      .expect("Content-Type", /application\/json/);

    assert.strictEqual(
      response.body.error,
      "User validation failed: username: Path `username` is required."
    );
  });

  test("should not allow creating a user with a short password", async () => {
    const newUser = {
      username: "validuser",
      name: "Test User",
      password: "ab", // too short
    };

    const response = await api
      .post("/api/users")
      .send(newUser)
      .expect(400) // Bad Request
      .expect("Content-Type", /application\/json/);

    assert.strictEqual(
      response.body.error,
      "Password must be at least 3 characters long"
    );
  });

  test("should allow creating a user with valid details", async () => {
    const newUser = {
      username: "validuser",
      name: "Test User",
      password: "validpassword",
    };

    const response = await api
      .post("/api/users")
      .send(newUser)
      .expect(201) // Created
      .expect("Content-Type", /application\/json/);

    assert.strictEqual(response.body.username, newUser.username);
    assert.strictEqual(response.body.name, newUser.name);
    assert.strictEqual(response.body.passwordHash, undefined);
  });
});

after(async () => {
  await mongoose.connection.close();
});

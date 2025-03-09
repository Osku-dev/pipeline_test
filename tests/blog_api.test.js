const assert = require("assert");
const { test, describe, after, beforeEach } = require("node:test");
const Blog = require("../models/blog");
const User = require("../models/user");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const helper = require("./test_helper");
const bcrypt = require("bcrypt");

const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany({});
  await Blog.insertMany(helper.initialBlogs);
});

describe("GET /api/blogs", () => {
  test("two blogs are returned as json", async () => {
    const response = await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    assert.deepStrictEqual(response.body.length, 2);
  });

  test("id is id and not _id", async () => {
    const response = await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const allBlogsHaveId = response.body.every((blog) => blog.id && !blog._id);

    assert.deepStrictEqual(allBlogsHaveId, true);
  });
});

describe("POST /api/blogs", () => {
  let token;
  let testUser;

  beforeEach(async () => {

    await User.deleteMany({});
    
    testUser = new User({
      username: "testuser",
      name: "Test User",
      passwordHash: await bcrypt.hash("password", 10),
    });

    await testUser.save();

    const loginResponse = await api
      .post("/api/login")
      .send({ username: "testuser", password: "password" });

    token = loginResponse.body.token;
  });

  test("a valid blog can be added", async () => {
    const newBlog = {
      title: "testTitle",
      author: "testAuthor",
      url: "url",
      likes: 10,
    };

    await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const response = await api.get("/api/blogs");

    const titles = response.body.map((r) => r.title);

    assert.strictEqual(response.body.length, 3); // Adjust expected length as needed
    assert(titles.includes("testTitle"));
  });

  test("likes default to 0 if not provided", async () => {
    const newBlog = {
      title: "testTitleWithoutLikes",
      author: "testAuthorWithoutLikes",
      url: "urlWithoutLikes",
    };

    const response = await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    assert.strictEqual(response.body.likes, 0);

    const blogsAtEnd = await helper.blogsInDb();
    const addedBlog = blogsAtEnd.find((blog) => blog.title === newBlog.title);

    assert.strictEqual(addedBlog.likes, 0);
  });

  test("blog without title or url returns 400 Bad Request", async () => {
    const newBlogWithoutTitle = {
      author: "testAuthor",
      url: "url",
      likes: 10,
    };

    const newBlogWithoutUrl = {
      title: "testTitle",
      author: "testAuthor",
      likes: 10,
    };

    await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(newBlogWithoutTitle)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(newBlogWithoutUrl)
      .expect(400)
      .expect("Content-Type", /application\/json/);
  });

  test("fails with status code 401 if Authorization header is present but token is missing", async () => {
    const newBlog = {
      title: "testTitle",
      author: "testAuthor",
      url: "url",
      likes: 10,
    };
  
    await api
      .post("/api/blogs")
      .set('Authorization', 'Bearer ')  // Include the header but with no token
      .send(newBlog)
      .expect(401)
      .expect("Content-Type", /application\/json/);
  });

});

describe("DELETE /api/blogs/:id", () => {
  let token;
  let testUser;

  beforeEach(async () => {
    await User.deleteMany({});

    testUser = new User({
      username: "testuser",
      name: "Test User",
      passwordHash: await bcrypt.hash("password", 10),
    });

    await testUser.save();

    const loginResponse = await api
      .post("/api/login")
      .send({ username: "testuser", password: "password" });

    token = loginResponse.body.token;
  });

  test.only("succeeds with status code 204 if id is valid and user is authorized", async () => {
    const newBlog = new Blog({
      title: "Test Blog",
      author: "Test Author",
      url: "http://example.com",
      likes: 5,
      user: testUser._id,
    });
    await newBlog.save();

    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart.find(
      (blog) => blog.title === newBlog.title && blog.author === newBlog.author
    );

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(204);

    const blogsAtEnd = await helper.blogsInDb();

    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1);

    const ids = blogsAtEnd.map((blog) => blog.id);
    assert(!ids.includes(blogToDelete.id));
  });
});

describe("PUT /api/blogs/:id", () => {
  test("succeeds in updating the likes field of a blog", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToUpdate = blogsAtStart[0];

    const updatedLikes = {
      likes: blogToUpdate.likes + 1,
    };

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedLikes)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    const updatedBlog = blogsAtEnd.find((blog) => blog.id === blogToUpdate.id);

    assert.strictEqual(updatedBlog.likes, updatedLikes.likes);

    assert.strictEqual(response.body.likes, updatedLikes.likes);
  });

  test("fails with status code 404 if the blog does not exist", async () => {
    const nonExistingId = await helper.nonExistingId();

    const updatedLikes = {
      likes: 10,
    };

    await api.put(`/api/blogs/${nonExistingId}`).send(updatedLikes).expect(404);
  });
});

after(async () => {
  await mongoose.connection.close();
});

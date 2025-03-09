const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", {
    username: 1,
    name: 1,
    id: 1,
  });
  response.json(blogs);
});

blogsRouter.post("/", async (request, response) => {

  if (!request.token) {
    return response.status(401).json({ error: 'token missing or invalid' });
  }
  const { title, author, url, likes } = request.body;

  const user = request.user;

  if (!title || !url) {
    return response.status(400).json({ error: "title and url are required" });
  }

  const blog = new Blog({
    title,
    author,
    url,
    likes: likes === undefined ? 0 : likes,
    user: user._id,
  });

  const savedBlog = await blog.save();

  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  response.status(201).json(savedBlog);
});

blogsRouter.delete("/:id", async (request, response) => {
  const blog = await Blog.findById(request.params.id);
  const user = request.user

  if (!blog) {
    return response.status(404).json({ error: "blog not found" });
  }

  if (blog.user.toString() !== user._id.toString()) {
    return response.status(403).json({ error: "permission denied" });
  }

  await Blog.findByIdAndDelete(request.params.id);

  response.status(204).end();
});

blogsRouter.put("/:id", async (request, response) => {
  const { likes } = request.body;

  // Update only the likes field of the blog
  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    { likes: likes },
    { new: true }
  );

  if (updatedBlog) {
    response.json(updatedBlog);
  } else {
    response.status(404).end(); // If no blog was found with the given ID
  }
});

module.exports = blogsRouter;

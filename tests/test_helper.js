const Blog = require('../models/blog')

const initialBlogs = [
  {
    title: "title",
    author: "author",
    url: "www.example.com",
    likes: 10
  },
  {
    title: "title2",
    author: "author2",
    url: "www.example2.com",
    likes: 7
  }
]

const nonExistingId = async () => {
  const blog = new Blog({ title: 'temporary', author: 'tempAuthor', url: 'www.tempurl.com', likes: 0 })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

module.exports = {
  initialBlogs, nonExistingId, blogsInDb
}
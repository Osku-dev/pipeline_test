import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import LoginForm from './components/LoginForm'
import BlogForm from './components/BlogForm'
import Togglable from './components/Togglable'
import blogService from './services/blogs'
import loginService from './services/login'
import './App.css'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)

  const [message, setMessage] = useState(null)
  const [messageType, setMessageType] = useState('') // 'success' or 'error'

  useEffect(() => {
    blogService.getAll().then((blogs) => setBlogs(blogs))
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const loginForm = () => {
    return (
      <div>
        <Togglable buttonLabel="login">
          <LoginForm
            username={username}
            password={password}
            handleUsernameChange={({ target }) => setUsername(target.value)}
            handlePasswordChange={({ target }) => setPassword(target.value)}
            handleSubmit={handleLogin}
          />
        </Togglable>
      </div>
    )
  }

  const blogFormRef = useRef()

  const blogForm = () => {
    return (
      <div>
        <Togglable buttonLabel="Create New Blog">
          <BlogForm handleCreateBlog={handleCreateBlog} ref={blogFormRef} />
        </Togglable>
      </div>
    )
  }

  const displayMessage = (messageText, type) => {
    setMessage(messageText)
    setMessageType(type)

    setTimeout(() => {
      setMessage(null)
    }, 5000)
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({ username, password })
      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(user))
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
      displayMessage('Login successful', 'success')
    } catch (exception) {
      displayMessage('Incorrect username or password', 'error')
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    setUser(null)
    displayMessage('Logged out successfully', 'success')
  }

  const handleCreateBlog = async (event) => {
    event.preventDefault()
    const newBlog = blogFormRef.current.getNewBlog()
    try {
      const returnedBlog = await blogService.createBlog(newBlog)

      const updatedBlog = {
        ...returnedBlog,
        user: {
          user: returnedBlog.user,
          username: user.username
        },
      }
      setBlogs((prevBlogs) =>
        prevBlogs.concat(updatedBlog)
      )
      blogFormRef.current.clearInputFields()
      displayMessage('New blog created successfully', 'success')
    } catch (exception) {
      displayMessage('Failed to create new blog', 'error')
    }
  }

  const handleLike = async (id) => {
    try {
      const blogToUpdate = blogs.find((b) => b.id === id)

      const updatedBlog = {
        ...blogToUpdate,
        likes: blogToUpdate.likes + 1,
      }

      const returnedBlog = await blogService.updateBlog(id, updatedBlog)

      const updatedBlogWithUser = {
        ...returnedBlog,
        user: blogToUpdate.user,
      }

      setBlogs((prevBlogs) =>
        prevBlogs.map((b) => (b.id !== id ? b : updatedBlogWithUser))
      )
    } catch (exception) {
      console.error('Error updating likes: ', exception)
    }
  }

  const handleRemove = async (blog) => {
    try {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete the blog "${blog.title}" by ${blog.author}?`
      )
      if (!confirmDelete) {
        return
      }

      await blogService.deleteBlog(blog.id)

      setBlogs(blogs.filter((b) => b.id !== blog.id))

      displayMessage('Blog deleted successfully', 'success')
    } catch (exception) {
      console.error('Error deleting blog: ', exception)
      displayMessage('Failed to delete blog', 'error')
    }
  }

  return (
    <div>
      <h1>Blogs</h1>
      {message && <div className={`${messageType}`}>{message}</div>}

      {user === null ? (
        loginForm()
      ) : (
        <div>
          <h2>
            {user.name} logged in
            <button onClick={handleLogout}>Logout</button>
          </h2>

          {blogForm()}

          {blogs
            .sort((a, b) => b.likes - a.likes)
            .map((blog) => (
              <Blog
                key={blog.id}
                blog={blog}
                handleLike={handleLike}
                handleRemove={handleRemove}
                user={user}
              />
            ))}
        </div>
      )}
    </div>
  )
}

export default App

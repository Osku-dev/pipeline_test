import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'
import BlogForm from './BlogForm'

const blog = {
  title: 'Sample Blog Title',
  author: 'John Doe',
  url: 'https://example.com',
  likes: 10,
  user: {
    name: 'John Doe',
    username: 'johndoe',
  },
}

const user = {
  username: 'johndoe',
}

let container
let handleLikeMock
let handleRemoveMock

beforeEach(() => {
  handleLikeMock = vi.fn()
  handleRemoveMock = vi.fn()

  container = render(
    <Blog
      blog={blog}
      user={user}
      handleLike={handleLikeMock}
      handleRemove={handleRemoveMock}
    />
  ).container
})

describe('<Blog />', () => {
  test('renders title and author by default', () => {
    expect(screen.getByText('Sample Blog Title John Doe')).toBeInTheDocument()

    expect(screen.queryByText('https://example.com')).not.toBeInTheDocument()
    expect(screen.queryByText('10')).not.toBeInTheDocument()
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
  })

  test('renders url, likes, and user after "View" button is clicked', async () => {
    const user = userEvent.setup()

    const viewButton = screen.getByText('View')
    await user.click(viewButton)

    expect(screen.getByText('https://example.com')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  test('calls handleLike twice when the "Like" button is clicked twice', async () => {
    const user = userEvent.setup()

    const viewButton = screen.getByText('View')
    await user.click(viewButton)

    const likeButton = screen.getByText('Like')
    await user.click(likeButton)
    await user.click(likeButton)

    expect(handleLikeMock).toHaveBeenCalledTimes(2)
  })
})

describe('<BlogForm />', () => {
  test('calls the callback function with the correct details when a new blog is created', async () => {
    const handleCreateBlog = vi.fn()

    render(<BlogForm handleCreateBlog={handleCreateBlog} />)

    const user = userEvent.setup()
    const titleInput = screen.getByPlaceholderText('Title')
    const authorInput = screen.getByPlaceholderText('Author')
    const urlInput = screen.getByPlaceholderText('Url')

    await user.type(titleInput, 'Test Blog Title')
    await user.type(authorInput, 'Test Blog Author')
    await user.type(urlInput, 'http://testblog.com')

    const createButton = screen.getByText('Create')
    await user.click(createButton)

    expect(handleCreateBlog).toHaveBeenCalledTimes(1)

    // The first argument is the event object.
    const event = handleCreateBlog.mock.calls[0][0]

    // Extract the values from the target of the event
    const newBlogData = {
      title: event.target.elements.title.value,
      author: event.target.elements.author.value,
      url: event.target.elements.url.value,
    }

    expect(newBlogData).toEqual({
      title: 'Test Blog Title',
      author: 'Test Blog Author',
      url: 'http://testblog.com',
    })
  })
})
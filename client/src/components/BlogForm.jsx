import React from 'react'
import { useState ,useImperativeHandle, forwardRef } from 'react'

const BlogForm = forwardRef ((props, ref) => {

  const [newBlog, setNewBlog] = useState({
    title: '',
    author: '',
    url: '',
  })

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setNewBlog({ ...newBlog, [name]: value })
  }

  const clearInputFields = () => {
    setNewBlog({ title: '', author: '', url: '' })
  }

  useImperativeHandle(ref, () => {
    return {
      clearInputFields,
      getNewBlog: () => newBlog
    }
  })
  return (
    <div>
      <h2>Create New</h2>
      <form onSubmit={props.handleCreateBlog}>
        <div>
          Title:
          <input
            type="text"
            name="title"
            value={newBlog.title}
            onChange={handleInputChange}
            placeholder='Title'
            required
          />
        </div>
        <div>
          Author:
          <input
            type="text"
            name="author"
            value={newBlog.author}
            onChange={handleInputChange}
            placeholder='Author'
            required
          />
        </div>
        <div>
          URL:
          <input
            type="text"
            name="url"
            value={newBlog.url}
            onChange={handleInputChange}
            placeholder='Url'
            required
          />
        </div>
        <button type="submit">Create</button>
      </form>
    </div>
  )
})

BlogForm.displayName = 'BlogForm'

export default BlogForm
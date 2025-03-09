import React, { useState } from 'react'

const Blog = ({ blog, handleLike, handleRemove, user }) => {

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }
  const [showDetails, setShowDetails] = useState(false)

  const toggleDetails = () => {
    setShowDetails(!showDetails)
  }

  return (
    <div style={blogStyle} className="blog">
      <div>
        <p>{blog.title} {blog.author}
          <button data-testid={`view-${blog.title}`}onClick={toggleDetails}>
            {showDetails ? 'Hide' : 'View'}
          </button> </p>

        {showDetails && (
          <div>
            <p>{blog.url}</p>
            <p><span data-testid="like-count">{blog.likes}</span><button data-testid={`like-${blog.title}`} onClick={() => handleLike(blog.id)}>Like</button></p>
            <p>{blog.user.name}</p>
            {user && blog.user.username === user.username && (
              <button onClick={() => handleRemove(blog)}>Remove</button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Blog

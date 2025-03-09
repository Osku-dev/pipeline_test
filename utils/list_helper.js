const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0);
};

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null;

  return blogs.reduce((prev, current) =>
    current.likes > prev.likes ? current : prev
  );
};

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null;

  const blogCount = blogs.reduce((count, blog) => {
    count[blog.author] = (count[blog.author] || 0) + 1;
    return count;
  }, {});

  const maxAuthor = Object.keys(blogCount).reduce((max, author) =>
    blogCount[author] > blogCount[max] ? author : max
  );

  return { author: maxAuthor, blogs: blogCount[maxAuthor] };
};

const mostLikes = (blogs) => {
  if (blogs.length === 0) return null;

  const likesMap = blogs.reduce((map, blog) => {
    const { author, likes } = blog;
    map[author] = (map[author] || 0) + likes;
    return map;
  }, {});

  const maxAuthor = Object.keys(likesMap).reduce((max, author) =>
    likesMap[author] > likesMap[max] ? author : max
  );

  return { author: maxAuthor, likes: likesMap[maxAuthor] };
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};

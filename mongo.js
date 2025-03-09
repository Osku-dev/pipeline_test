const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.error('Error: Please provide the password as an argument');
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://Osku-dev:${password}@cluster0.i2fag.mongodb.net/testblogiApp?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set('strictQuery', false);

mongoose.connect(url)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  });

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
});

const Blog = mongoose.model('Blog', blogSchema);

if (process.argv.length === 7) {
  const title = process.argv[3];
  const author = process.argv[4];
  const url = process.argv[5];
  const likes = parseInt(process.argv[6], 10); // Parsing the likes input

  if (isNaN(likes)) {
    console.error('Error: The "likes" argument must be a number');
    mongoose.connection.close();
    process.exit(1);
  }

  const blog = new Blog({
    title: title,
    author: author,
    url: url,
    likes: likes,
  });

  blog.save()
    .then(() => {
      console.log(`Added blog: ${title} by ${author} with ${likes} likes`);
    })
    .catch((error) => {
      console.error('Error saving the blog:', error.message);
    })
    .finally(() => {
      mongoose.connection.close();
    });
} else if (process.argv.length === 3) {
  Blog.find({})
    .then(result => {
      console.log('Blogs:');
      result.forEach(blog => {
        console.log(`${blog.title} by ${blog.author} (${blog.likes} likes)`);
      });
    })
    .catch((error) => {
      console.error('Error retrieving blogs:', error.message);
    })
    .finally(() => {
      mongoose.connection.close();
    });
} else {
  console.error('Error: Please provide the correct number of arguments.');
  mongoose.connection.close();
  process.exit(1);
}

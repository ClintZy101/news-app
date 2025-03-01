const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["user", "admin"], default: "user" },
});

const NewsSchema = new mongoose.Schema({
  title: String,
  text: String,
  images: [String],
  tags: [String],
  author: String,
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", UserSchema);
const News = mongoose.model("News", NewsSchema);

// User Registration
app.post("/api/auth/register", async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ email, password: hashedPassword, role: "user" });
  await newUser.save();
  res.json({ message: "User registered successfully" });
});

// Admin Registration
app.post("/api/auth/register-admin", async (req, res) => {
  const { email, password, secretKey } = req.body;
  if (secretKey !== process.env.ADMIN_SECRET_KEY)
    return res.status(403).json({ message: "Invalid secret key" });
  const hashedPassword = await bcrypt.hash(password, 10);
  const newAdmin = new User({ email, password: hashedPassword, role: "admin" });
  await newAdmin.save();
  res.json({ message: "Admin registered successfully" });
});

// Sign In
app.post("/api/auth/signin", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.json({ token, email: user.email, role: user.role });
});

// Middleware to authenticate and authorize users
const authMiddleware = (roles = []) => {
  if (typeof roles === "string") {
    roles = [roles];
  }

  return (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ message: "Unauthorized" });
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      req.user = decoded;
      next();
    });
  };
};

// Create News (only admin)
app.post("/api/news", authMiddleware("admin"), async (req, res) => {
  const { title, text, images, tags, author } = req.body;
  const trimmedTags = tags.map(tag => tag.trim());
  const newNews = new News({ title, text, images, tags: trimmedTags, author });
  await newNews.save();
  io.emit("newsCreated", newNews); // Emit event to all connected clients
  res.json(newNews);
});

// Edit News (only admin)
app.put('/api/news/:id', authMiddleware('admin'), async (req, res) => {
  try {
    const { title, text, images, tags } = req.body;
    const updatedNews = await News.findByIdAndUpdate(
      req.params.id,
      { title, text, images, tags },
      { new: true }
    );
    if (!updatedNews) return res.status(404).json({ message: 'News not found' });
    io.emit('newsUpdated', updatedNews); // Emit event to all connected clients
    res.json(updatedNews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update news' });
  }
});

// Delete News with Confirmation (only admin)
app.delete("/api/news/:id", authMiddleware("admin"), async (req, res) => {
  const news = await News.findByIdAndDelete(req.params.id);
  if (!news) return res.status(404).json({ message: "News not found" });
  res.json({ message: "News deleted successfully" });
});


// Get News (Infinite Scroll)
app.get("/api/news", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 3;
    const news = await News.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json(news);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

// Get all available tags
app.get("/api/news/tags", async (req, res) => {
  try {
    const tags = await News.distinct("tags");
    const trimmedTags = tags.map(tag => tag.trim());
    res.json(trimmedTags);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tags" });
  }
});

// Get News by Tags with Pagination (Infinite Scroll)
app.get("/api/news/tags/:tag", async (req, res) => {
  try {
    const { tag } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 3;
    const news = await News.find({ tags: tag.trim() })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

// Get news views and likes statistics
app.get('/api/news/statistics', authMiddleware('admin'), async (req, res) => {
  try {
    const statistics = await News.find({}, 'title views likes dislikes').sort({ views: -1 });
    res.json(statistics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get News by ID
app.get("/api/news/:id", async (req, res) => {
  const news = await News.findById(req.params.id);
  if (!news) return res.status(404).json({ message: "News not found" });
  news.views += 1;
  await news.save();
  res.json(news);
});

// Like/Dislike News
app.post("/news/:id/like", async (req, res) => {
  const news = await News.findById(req.params.id);
  if (!news) return res.status(404).json({ message: "News not found" });
  news.likes += 1;
  await news.save();
  io.emit("newsUpdated", news); // Emit event to all connected clients
  res.json({ likes: news.likes });
});

app.post("/news/:id/dislike", async (req, res) => {
  const news = await News.findById(req.params.id);
  if (!news) return res.status(404).json({ message: "News not found" });
  news.dislikes += 1;
  await news.save();
  io.emit("newsUpdated", news); // Emit event to all connected clients
  res.json({ dislikes: news.dislikes });
});

// Increment views for a news article
app.post("/news/:id/view", async (req, res) => {
  const news = await News.findById(req.params.id);
  if (!news) return res.status(404).json({ message: "News not found" });
  news.views += 1;
  await news.save();
  io.emit("newsUpdated", news); // Emit event to all connected clients
  res.json({ views: news.views });
});

// Get news views and likes statistics
app.get('/api/news/statistics', authMiddleware('admin'), async (req, res) => {
  try {
    const statistics = await News.find({}, 'title views likes dislikes').sort({ views: -1 });
    res.json(statistics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get all news for admin panel with pagination
app.get('/api/admin/news', authMiddleware('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const totalArticles = await News.countDocuments();
    const totalPages = Math.ceil(totalArticles / limit);
    const articles = await News.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ articles, totalPages });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// WebSocket setup
io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("likeNews", async ({ id }) => {
    const news = await News.findById(id);
    if (news) {
      news.likes += 1;
      await news.save();
      io.emit("newsUpdated", news);
    }
  });

  socket.on("dislikeNews", async ({ id }) => {
    const news = await News.findById(id);
    if (news) {
      news.dislikes += 1;
      await news.save();
      io.emit("newsUpdated", news);
    }
  });

  socket.on("viewNews", async ({ id }) => {
    const news = await News.findById(id);
    if (news) {
      news.views += 1;
      await news.save();
      io.emit("newsUpdated", news);
    }
  });
});

const PORT = process.env.PORT || 5555;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

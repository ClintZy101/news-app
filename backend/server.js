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
  username: String,
  password: String,
  secretKey: String,
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

// Admin Registration
app.post("/register", async (req, res) => {
  const { username, password, secretKey } = req.body;
  if (secretKey !== process.env.SECRET_KEY)
    return res.status(403).json({ message: "Invalid secret key" });
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, password: hashedPassword, secretKey });
  await newUser.save();
  res.json({ message: "Admin registered successfully" });
});

// Admin Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ message: "User not found" });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.json({ token });
});

// Create News
app.post("/api/news", async (req, res) => {
  const { title, text, images, tags, author } = req.body;
  const trimmedTags = tags.map(tag => tag.trim());
  const newNews = new News({ title, text, images, tags: trimmedTags, author });
  await newNews.save();
  io.emit("newsCreated", newNews); // Emit event to all connected clients
  res.json(newNews);
});

// Get News  (Infinite Scroll)
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
    // const limit = 3;
    const news = await News.find({ tags: tag.trim() })
      .sort({ createdAt: -1 })
      // .skip((page - 1) * limit)
      // .limit(limit);
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

// Get News by ID
app.get("/news/:id", async (req, res) => {
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

// Delete News with Confirmation
app.delete("/news/:id", async (req, res) => {
  const news = await News.findByIdAndDelete(req.params.id);
  if (!news) return res.status(404).json({ message: "News not found" });
  res.json({ message: "News deleted successfully" });
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
});

const PORT = process.env.PORT || 5555;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

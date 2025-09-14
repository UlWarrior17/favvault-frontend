require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();

// Schema + Model
const favoriteSchema = new mongoose.Schema({
  type: String,
  title: String,
  year: String,
});

favoriteSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Fav = mongoose.model("Favorite", favoriteSchema);

// MongoDB connection
console.log("Connecting to", process.env.MONGODB_URI);
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((error) => {
    console.log("❌ Error:", error.message);
  });

// Middleware
app.use(express.json());

// ROUTES

// READ all
app.get("/api/favs", async (req, res) => {
  const favs = await Fav.find({});
  res.json(favs);
});

// CREATE
app.post("/api/favs", async (req, res) => {
  const { type, title, year } = req.body;
  if (!type || !title || !year) {
    return res.status(400).json({ error: "⚠️ Please fill all fields" });
  }

  const fav = new Fav({ type, title, year });
  const savedFav = await fav.save();
  res.status(201).json(savedFav);
});

// DELETE
app.delete("/api/favs/:id", async (req, res) => {
  await Fav.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

// UPDATE
app.put("/api/favs/:id", async (req, res) => {
  const { type, title, year } = req.body;

  const updatedFav = await Fav.findByIdAndUpdate(
    req.params.id,
    { type, title, year },
    { new: true, runValidators: true }
  );

  if (!updatedFav) {
    return res.status(404).json({ error: "Favorite not found" });
  }

  res.json(updatedFav);
});

// Start server
app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});

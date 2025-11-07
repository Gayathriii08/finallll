const express = require('express');
const dotEnv = require('dotenv');
const { MongoClient, ObjectId } = require("mongodb");

dotEnv.config();
const app = express();
app.use(express.json()); // to parse JSON request bodies

const PORT = process.env.PORT || 5000;
const client = new MongoClient(process.env.MONGO_URI);

// Connect to MongoDB once
let db;
client.connect()
  .then(() => {
    db = client.db("atlas"); // use your DB name here
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

/* -------------------- CRUD Routes -------------------- */

// CREATE
app.post('/api/opportunities', async (req, res) => {
  try {
    const result = await db.collection("opportunities").insertOne(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ all
app.get('/api/opportunities', async (req, res) => {
  try {
    const opportunities = await db.collection("opportunities").find().toArray();
    res.json(opportunities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ one by ID
app.get('/api/opportunities/:id', async (req, res) => {
  try {
    const opportunity = await db.collection("opportunities").findOne({ _id: new ObjectId(req.params.id) });
    if (!opportunity) return res.status(404).json({ message: "Not found" });
    res.json(opportunity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE
app.put('/api/opportunities/:id', async (req, res) => {
  try {
    const result = await db.collection("opportunities").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE
app.delete('/api/opportunities/:id', async (req, res) => {
  try {
    const result = await db.collection("opportunities").deleteOne({ _id: new ObjectId(req.params.id) });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ---------------------------------------------------- */

// Start server
app.listen(PORT, () => {
  console.log(`Server started and running at ${PORT}`);
});

require("dotenv").config();

const express = require("express");
const { exec } = require("child_process");
const cors = require("cors");


// Basic Express setup
const app = express();
app.use(cors());
app.use(express.json());


// Middleware to validate URLs
const validateURL = (req, res, next) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: "URL parameter is required" });
  }
  try {
    new URL(url);
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid URL format" });
  }
};

app.get("/api/download/song", validateURL, (req, res) => {
  const { url } = req.query;
  console.log(url);
  exec(`spotdl ${url} --output ./audios`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).send("Error processing request");
    }
    res.json({ success: true, message: "Song downloaded successfully" });
  });
});

app.get("/api/download/playlist", validateURL, (req, res) => {
  const { url } = req.query;
  console.log(url);
  exec(`spotdl ${url} --output ./audios`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).send("Error processing request");
    }
    res.json({ success: true, message: "Playlist downloaded successfully" });
  });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(3000, () => {
  console.log(`Example app listening on port 3000`);
});

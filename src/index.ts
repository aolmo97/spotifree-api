// src/index.ts
import express, { Express, NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import { exec } from "child_process";
import cors from "cors";
import * as spotifyService from "./services/playlists/spotifyService";
import { log } from "console";
import path from "path";
import mongoose from "mongoose";
import Track from "./models/Track";
import fs from "fs/promises";
import { join } from "path";

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/spotifree-app")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const app: Express = express();
const port = process.env.PORT || 3000;

// Aumentar límite de payload
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Add CORS middleware
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("hello world");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

// Middleware to validate URLs
const validateURL = (req: Request, res: Response, next: NextFunction) => {
  const url = req.query.url;
  if (!url) {
    res.status(400).json({ error: "URL parameter is required" });
    return;
  }
  try {
    new URL(url as string);
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid URL format" });
    return;
  }
};
app.post(
  "/api/playlists",
  (req: Request, res: Response, next: NextFunction) => {
    const { accessToken } = req.body;
    spotifyService
      .fetchUserPlaylists(accessToken as string)
      .then((data) => res.json(data))
      .catch((error) =>
        res.status(500).json({ error: "Failed to fetch playlists" })
      );
  }
);
app.post(
  "/api/playlists/tracks",
  (req: Request, res: Response, next: NextFunction) => {
    const { playlistId, accessToken } = req.body;
    spotifyService
      .getPlaylistTracks(playlistId as string, accessToken as string)
      .then((data) => res.json(data))
      .catch((error) =>
        res.status(500).json({ error: "Failed to fetch playlists" })
      );
  }
);

app.post("/api/download/song", async (req: Request, res: Response) => {
  const trackData = req.body;
  const desiredFilename = `${trackData.id}.mp3`;
  console.log("trackData:", trackData);
  console.log("Downloading song...");

  exec(
    `spotdl ${trackData.url} --output ./audios/`,
    async (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return res.status(500).send("Error processing request");
      }

      try {
        // Leer el directorio
        const files = await fs.readdir("./audios");
        const audioFiles = files.filter((file) => file.endsWith(".mp3"));

        if (audioFiles.length === 0) {
          return res.status(500).send("No MP3 files found");
        }

        const lastFile = audioFiles[audioFiles.length - 1];
        const oldPath = join(process.cwd(), "audios", lastFile);
        const newPath = join(process.cwd(), "audios", desiredFilename);

        // Renombrar el archivo
        await fs.rename(oldPath, newPath);

        const audioUrl = `${process.env.MEDIA_SERVER_URL}/audios/${desiredFilename}`;

        const track = await Track.create({
          id: trackData.id,
          name: trackData.name,
          preview_url: trackData.preview_url,
          duration_ms: trackData.duration_ms,
          album: trackData.album,
          artists: trackData.artists,
          href: audioUrl,
          filename: desiredFilename,
        });

        console.log("Track created:", track);
        res.json({
          success: true,
          message: "Song downloaded successfully",
          file: track,
        });
      } catch (error) {
        console.error(`Error renaming file: ${error}`);
        return res.status(500).send("Error renaming downloaded file");
      }
    }
  );
});

app.post("/api/download/playlist", async (req: Request, res: Response) => {
  const { url, songs } = req.body;

  console.log("Downloading playlist with url:", url);

  exec(`spotdl ${url} --output ./audios/`, async (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).send("Error processing request");
    }

    try {
      // Procesar las canciones de forma secuencial
      for (const song of songs) {
        try { 
          // Leer el directorio
          const files = await fs.readdir("./audios");
          const audioFiles = files.filter((file) => file.endsWith(".mp3"));

          if (audioFiles.length === 0) {
            console.log("No MP3 files found for song:", song.name);
            continue;
          }

          const desiredFilename = `${song.id}.mp3`;
          console.log("Processing song:", song.name, "->", desiredFilename);

          // Buscar el archivo que corresponde a esta canción
          const songFile = audioFiles.find(
            (file) =>
              file.toLowerCase().includes(song.name.toLowerCase()) ||
              file.toLowerCase().includes(song.artists[0].name.toLowerCase())
          );

          if (!songFile) {
            console.log("Could not find matching file for song:", song.name);
            continue;
          }

          const oldPath = join(process.cwd(), "audios", songFile);
          const newPath = join(process.cwd(), "audios", desiredFilename);

          // Renombrar el archivo
          await fs.rename(oldPath, newPath);

          const audioUrl = `${process.env.MEDIA_SERVER_URL}/audios/${desiredFilename}`;

          const track = await Track.create({
            id: song.id,
            name: song.name,
            href: audioUrl,
            preview_url: song.preview_url,
            duration_ms: song.duration_ms,
            album: song.album.name,
            artist: song.artists,
            image: song.album.images[0].url,
          });
          console.log("Track created:", track);
        } catch (songError) {
          console.error(`Error processing song ${song.name}:`, songError);
          // Continuar con la siguiente canción en caso de error
        }
      }

      res.json({
        success: true,
        message: "Playlist processed successfully",
      });
    } catch (error) {
      console.error(`Error processing playlist:`, error);
      return res.status(500).send("Error processing playlist");
    }
  });
});

app.get(
  "/api/song/:songId",
  async (
    req: Request<{ songId: string }, any, any, any>,
    res: Response<any>
  ) => {
    try {
      const { songId } = req.params;
      console.log("songId:", songId);

      const track = await Track.findOne({ id: songId });
      console.log("track:", track);
      if (!track) {
        return res.status(404).json({ error: "Track not found" });
      }

      res.json(track);
    } catch (error) {
      console.error("Error fetching track:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

app.use("/audios", express.static(path.join(__dirname, "../audios")));

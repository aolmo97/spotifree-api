// src/index.ts
import express, { Express, NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import { exec } from "child_process";
import cors from "cors";
import * as spotifyService from "./services/playlists/spotifyService";
import { log } from "console";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Add CORS middleware
app.use(cors());

// Add body parser middleware for JSON
app.use(express.json());

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

app.get("/api/download/song", validateURL, (req: Request, res: Response) => {
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

app.post(
  "/api/download/playlist",
  (req: Request, res: Response) => {
    const { url } = req.body;
    console.log("playlistURL:", url);
    
    let outputData = '';
    
    exec(`spotdl ${url} --output ./audios`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return res.status(500).send("Error processing request");
      }
      
      // Guardamos la salida del comando y la logeamos
      outputData = stdout;
      console.log("Script output:", outputData);
      console.log("stderr:", stderr); // Agregamos log del stderr

      // Verificamos que el directorio existe
      exec('dir .\\audios', (err, dirOutput) => {
        console.log("Directory contents:", dirOutput); // Log del contenido del directorio
        
        exec('dir /b /a-d .\\audios', (err, filesOutput) => {
          if (err) {
            console.error(`Error listing files: ${err}`);
            return res.status(500).send("Error listing downloaded files");
          }

          console.log("Files output:", filesOutput); // Log de la lista de archivos

          // Creamos un array con las URLs relativas de los archivos
          const audioFiles = filesOutput
            .trim()
            .split('\r\n')
            .filter(file => file.endsWith('.mp3'));
          
          console.log("Audio files found:", audioFiles); // Log de los archivos encontrados

          const audioUrls = audioFiles.map(file => `/audios/${file}`);
          console.log("Audio URLs:", audioUrls); // Log de las URLs generadas

          res.json({ 
            success: true, 
            message: "Playlist downloaded successfully",
            scriptOutput: outputData,
            files: audioUrls
          });
        });
      });
    });
  }
);

app.post(
  "/api/playLists", 
  (req: Request, res: Response, next: NextFunction) => {
    const { accessToken } = req.body;
    console.log(accessToken);
    spotifyService.fetchUserPlaylists(accessToken as string)
      .then(data => res.json(data))
      .catch(error => res.status(500).json({ error: "Failed to fetch playlists" }));
    
    }
);

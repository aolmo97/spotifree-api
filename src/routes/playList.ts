import express, { Request, Response } from 'express';
import { SpotifyDownloader } from '../services/spotifyDownloader';
import { Song } from '../models/Song';
import { Playlist } from '../models/Playlist';
import { SpotifyPlaylistData } from '../types';

const router = express.Router();

interface ImportPlaylistRequest extends Request {
  body: {
    spotifyPlaylistUrl: string;
    userId: string;
  };
}

// Importar playlist
router.post('/import', async (req: ImportPlaylistRequest, res: Response) => {
  try {
    const { spotifyPlaylistUrl, userId } = req.body;
    
    // 1. Obtener información de la playlist de Spotify
    const playlistData: SpotifyPlaylistData = await spotifyApi.getPlaylist(spotifyPlaylistUrl);
    
    // 2. Crear nueva playlist
    const playlist = new Playlist({
      spotifyId: playlistData.id,
      name: playlistData.name,
      userId,
      importDate: new Date()
    });
    
    // 3. Procesar cada canción
    for (const track of playlistData.tracks.items) {
      // Verificar si la canción ya existe
      let song = await Song.findOne({ spotifyId: track.track.id });
      
      if (!song) {
        // Si no existe, descargar y guardar
        const outputPath = `/music/${track.track.id}.mp3`;
        await SpotifyDownloader.downloadSong(track.track.external_urls.spotify, outputPath);
        
        song = new Song({
          spotifyId: track.track.id,
          title: track.track.name,
          artist: track.track.artists[0].name,
          filePath: outputPath,
          downloadDate: new Date()
        });
        await song.save();
      }
      
      playlist.songs.push(song._id);
    }
    
    await playlist.save();
    res.json({ success: true, playlistId: playlist._id });
    
  } catch (error) {
    console.error('Error importing playlist:', error);
    res.status(500).json({ error: 'Error importing playlist' });
  }
});

// Obtener playlist
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate('songs');
    res.json(playlist);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching playlist' });
  }
});

export default router;
// services/spotifyDownloader.ts
import { spawn } from 'child_process';

export class SpotifyDownloader {
  static async downloadSong(spotifyUrl: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const spotdl = spawn('spotdl', ['--output', outputPath, spotifyUrl]);
      
      spotdl.on('close', (code: number) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`spotdl process exited with code ${code}`));
        }
      });
    });
  }
}
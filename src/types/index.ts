// types/index.ts
import { Document } from "mongoose";

export interface ISong extends Document {
  spotifyId: string;
  title: string;
  artist: string;
  filePath: string;
  downloadDate: Date;
}

export interface IPlaylist extends Document {
  spotifyId: string;
  name: string;
  userId: string;
  songs: ISong["_id"][];
  importDate: Date;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyPlaylistData {
  id: string;
  name: string;
  tracks: {
    items: Array<{
      track: SpotifyTrack;
    }>;
  };
}
export interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

// models/Playlist.ts
import mongoose, { Schema } from 'mongoose';
import { IPlaylist } from '../types';

const playlistSchema = new Schema<IPlaylist>({
  spotifyId: { type: String, required: true },
  name: String,
  userId: String,
  songs: [{ type: Schema.Types.ObjectId, ref: 'Song' }],
  importDate: Date
});

export const Playlist = mongoose.model<IPlaylist>('Playlist', playlistSchema);

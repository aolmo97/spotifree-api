// models/Song.ts
import mongoose, { Schema } from 'mongoose';
import { ISong } from '../types';

const songSchema = new Schema<ISong>({
  spotifyId: { type: String, unique: true, required: true },
  title: String,
  artist: String,
  filePath: String,
  downloadDate: Date
});

export const Song = mongoose.model<ISong>('Song', songSchema);
import mongoose, { Schema, Document } from 'mongoose';

export interface ITrack extends Document {
  id: string;
  name: string;
  preview_url: string | null;
  duration_ms: number;
  album: string;
  artists: string[];
  href: string;
  external_urls: {
    spotify: string;
  };
}

const TrackSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  preview_url: { type: String, default: null },
  duration_ms: { type: Number, required: true },
  album: { type: String, required: true },
  artists: { type: [String], required: true },
  href: { type: String, required: true },
});

export default mongoose.model<ITrack>('Track', TrackSchema); 
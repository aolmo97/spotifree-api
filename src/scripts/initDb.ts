import mongoose from 'mongoose';
import Track from '../models/Track';
import dotenv from 'dotenv';

dotenv.config();

const initializeDatabase = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/spotify-app');
    console.log('Connected to MongoDB');

    // Crear un documento de ejemplo
    const exampleTrack = new Track({
      id: "example_id",
      name: "Example Song",
      preview_url: "https://example.com/preview",
      duration_ms: 300000,
      album: {
        name: "Example Album",
        images: [
          {
            url: "https://example.com/image.jpg",
            height: 640,
            width: 640
          }
        ]
      },
      artists: [
        {
          id: "artist_id",
          name: "Example Artist",
          href: "https://api.spotify.com/v1/artists/example"
        }
      ],
      href: "https://api.spotify.com/v1/tracks/example",
      external_urls: {
        spotify: "https://open.spotify.com/track/example"
      }
    });

    // Guardar el documento
    await exampleTrack.save();
    console.log('Example track created successfully');

  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    // Cerrar la conexión
    await mongoose.connection.close();
  }
};

initializeDatabase(); 
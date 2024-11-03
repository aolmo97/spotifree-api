const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID as string;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET as string;
const SCOPES = [
  'user-read-private',
  'user-read-email',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-library-read',
  'user-modify-playback-state',
  'streaming',
  'user-read-playback-state',
  'user-read-recently-played',
  'user-top-read'
];

const redirectUri = process.env.EXPO_PUBLIC_SPOTIFY_REDIRECT_URI as string;

export { CLIENT_ID, CLIENT_SECRET, SCOPES, redirectUri };

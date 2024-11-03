import { CLIENT_ID, CLIENT_SECRET, redirectUri } from "../../constants";
import { TokenData } from "../../types";

export const exchangeCodeForToken = async (request: any, code: string) => {
  const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: CLIENT_ID,
      code_verifier: request?.codeVerifier || "",
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error("Token Response Error:", errorText);
    throw new Error(`Token exchange failed: ${errorText}`);
  }

  const tokenData: TokenData = await tokenResponse.json();
  return tokenData;
};

export const fetchUserProfile = async (accessToken: string) => {
  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    // Intentar leer el cuerpo de la respuesta como texto primero
    const errorText = await response.text();
    let errorMessage;

    try {
      // Intentar parsear como JSON si es posible
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error?.message || errorData.error || errorText;
    } catch {
      // Si no es JSON, usar el texto directamente
      errorMessage = errorText;
    }

    throw new Error(
      `Error al obtener el perfil de usuario (${response.status}): ${errorMessage}`
    );
  }

  return response.json();
};

export const fetchUserPlaylists = async (token: string) => {
  if (!token) {
    throw new Error("No authentication token available");
  }
  try {
    const response = await fetch(`https://api.spotify.com/v1/me/playlists`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("response ");
    console.log(response);
    if (!response.ok) {
      throw new Error("Failed to fetch playlists");
    }
    const data = await response.json();
    return data;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Unknown error");
  }
};
export const getPlaylistTracks = async (playlistId: string) => {
  const response = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch playlist tracks");
  }
  return response.json();
};

export const downloadPlaylist = async (playlistId: string) => {
  const Spotify = require("spotifydl-core").default;
  const spotify = new Spotify({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
  });
  const tracks = await getPlaylistTracks(playlistId);
  return tracks;
};
export const downloadSong = async (songUrl: string) => {
  const Spotify = require("spotifydl-core").default;
  console.log(CLIENT_ID, CLIENT_SECRET);
  const spotify = new Spotify({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
  });
  const infoTrack = await spotify.getTrackInfo(songUrl);
  console.log(infoTrack);
  const track = await spotify.downloadTrack(songUrl);
  return track;
};

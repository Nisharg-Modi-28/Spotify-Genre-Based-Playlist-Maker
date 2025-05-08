const axios = require("axios");
require("dotenv").config();

async function getAccessToken() {
  const res = await axios.post(
    "https://accounts.spotify.com/api/token",
    new URLSearchParams({ grant_type: "client_credentials" }),
    {
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET
          ).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return res.data.access_token;
}

async function getPlaylistTracks(token, playlistId) {
  const res = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.items;
}

(async () => {
  const token = await getAccessToken();
  // const playlistId = "3bDJLJzvUBxBV4C7mezz6p";
  const playlistId = "266rianuwlkcqziaau9k0rq8b"; // desai english mix playlist 
  const tracks = await getPlaylistTracks(token, playlistId);

  const romanticTracks = [];

  for (const item of tracks) {
    const track = item.track;

    // Sometimes there might be null tracks or artists
    if (!track || !track.artists || track.artists.length === 0) continue;

    const artistId = track.artists[0].id;

    try {
      const artistRes = await axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const genres = artistRes.data.genres;
      if (genres.some(g => g.toLowerCase().includes("romantic") || g.toLowerCase().includes("love") || g.toLowerCase().includes("filmi") || g.toLowerCase().includes("bollywood"))) {
        romanticTracks.push(track.name);
      }
    } catch (err) {
      console.error(`Error fetching genres for artist ${artistId}:`, err.message);
    }
  }

  console.log("Romantic songs:");
  romanticTracks.forEach((name, index) => console.log(`${index + 1}. ${name}`));
})();

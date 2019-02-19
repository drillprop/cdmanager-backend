const { apikey } = require('../../config');
const fetch = require('node-fetch');

module.exports = {
  Query: {
    albumslastfm: async (parent, args, ctx, info) => {
      const { search } = args;
      let baseUrl = `http://ws.audioscrobbler.com/2.0/?method=album.search&album=${search}&api_key=${apikey}&format=json`;
      const res = await fetch(baseUrl);
      const json = await res.json();
      const album = await json.results.albummatches.album;
      const albumQuery = album.map(item => {
        return {
          title: item.name,
          artist: item.artist,
          image: item.image[2]['#text'],
          id: item.mbid
        };
      });
      return albumQuery;
    },
    albums: async (parent, args, ctx, info) => {
      const { search } = args;
      const lowerSearch = search.toLowerCase();
      if (global.albums) {
        return global.albums.filter(album => {
          const { title, artist } = album;
          if (title.includes(lowerSearch) || artist.includes(lowerSearch)) {
            return album;
          }
        });
      }
    }
  }
};

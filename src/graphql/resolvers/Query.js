import 'dotenv/config';
import fetch from 'node-fetch';
import User from '../../models/User';
import albumBrowse from '../../utils/albumBrowse';
import albumSearch from '../../utils/albumSearch';

const Query = {
  albumslastfm: async (parent, args, ctx, info) => {
    const { search } = args;
    let baseUrl = `http://ws.audioscrobbler.com/2.0/?method=album.search&album=${search}&api_key=${process.env.LASTFM_API_KEY}&limit=15&format=json`;
    const res = await fetch(baseUrl);
    const json = await res.json();
    const album = await json.results.albummatches.album;
    const albumQuery = await album.map((item) => {
      return {
        title: item.name,
        artist: item.artist,
        imageSmall: item.image[1]['#text'],
        imageLarge: item.image[2]['#text'],
      };
    });
    return albumQuery;
  },

  albums: async (parent, { skip = 0, limit = 10, search = '' }, ctx) => {
    if (!ctx.req.userId) {
      throw Error('You need to login to see your recently added albums');
    }
    const user = await User.findById(ctx.req.userId);
    if (!user)
      throw Error('You need to login to see your recently added albums');

    const total = user.albums.length;
    const albums = search
      ? await albumSearch(ctx.req.userId, search)
      : await albumBrowse(ctx.req.userId, skip, limit);

    return {
      total,
      albums,
    };
  },
  me: async (parent, args, ctx, info) => {
    if (!ctx.req.userId) {
      return null;
    }
    return User.findById(ctx.req.userId);
  },
};

export default Query;

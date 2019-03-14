import 'dotenv/config';
import fetch from 'node-fetch';
import Album from '../../models/Album';
import User from '../../models/User';

const Query = {
  albumslastfm: async (parent, args, ctx, info) => {
    const { search } = args;
    let baseUrl = `http://ws.audioscrobbler.com/2.0/?method=album.search&album=${search}&api_key=${
      process.env.LASTFM_API_KEY
    }&format=json`;
    const res = await fetch(baseUrl);
    const json = await res.json();
    const album = await json.results.albummatches.album;
    const albumQuery = album.map(item => {
      return {
        title: item.name,
        artist: item.artist,
        image: item.image[2]['#text']
      };
    });
    return albumQuery;
  },
  albums: async (parent, { search, last = 4 }, ctx, info) => {
    if (!ctx.req.userId) {
      throw new Error('You need to login to see your recently added albums');
    }
    if (!search) {
      const getAlbums = await User.findById(ctx.req.userId, {
        albums: { $slice: -last }
      });
      const lastAlbums = await getAlbums.albums;
      return lastAlbums.reverse();
    }
    return Album.find(
      { $text: { $search: search } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } });
  },
  me: async (parent, args, ctx, info) => {
    if (!ctx.req.userId) {
      return null;
    }
    return User.findById(ctx.req.userId);
  }
};

export default Query;

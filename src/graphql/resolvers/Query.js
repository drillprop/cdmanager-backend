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
    const albumQuery = await album.map(item => {
      return {
        title: item.name,
        artist: item.artist,
        image: item.image[2]['#text']
      };
    });
    return albumQuery;
  },
  albumsLength: async (parent, args, ctx, info) => {
    const user = await User.findById(ctx.req.userId);
    const length = user.albums.length;
    return length;
  },
  albums: async (parent, { last = 10 }, ctx, info) => {
    if (!ctx.req.userId) {
      throw new Error('You need to login to see your recently added albums');
    }
    const getAlbums = await User.findById(ctx.req.userId, {
      albums: { $slice: [-last, 10] }
    });
    const lastAlbums = await getAlbums.albums;
    const albums = lastAlbums.reverse();
    return albums;
  },
  me: async (parent, args, ctx, info) => {
    if (!ctx.req.userId) {
      return null;
    }
    return User.findById(ctx.req.userId);
  }
};

export default Query;

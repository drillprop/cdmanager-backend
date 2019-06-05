import 'dotenv/config';
import fetch from 'node-fetch';
import User from '../../models/User';
import { albumSearch, albumBrowse, reduceToObject } from './agregateFunctions';

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

  albums: async (parent, { skip = 0, limit = 10, search = '' }, ctx) => {
    if (!ctx.req.userId) {
      throw new Error('You need to login to see your recently added albums');
    }
    const searchedAlbums = await User.aggregate(
      albumSearch(ctx.req.userId, skip, limit, search)
    );
    const browsedAlbums = await User.aggregate(
      albumBrowse(ctx.req.userId, skip, limit)
    );

    if (search) return reduceToObjectt(searchedAlbums);
    else return reduceToObject(browsedAlbums);
  },
  me: async (parent, args, ctx, info) => {
    if (!ctx.req.userId) {
      return null;
    }
    return User.findById(ctx.req.userId);
  }
};

export default Query;

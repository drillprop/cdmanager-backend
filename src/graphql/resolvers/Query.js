import 'dotenv/config';
import fetch from 'node-fetch';
import User from '../../models/User';
import { Types } from 'mongoose';

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
    const getAlbums = await User.findById(ctx.req.userId).select('albums');
    const { length } = getAlbums.albums;
    return length;
  },
  albums: async (parent, { skip = 0, limit = 10, search }, ctx, info) => {
    if (!ctx.req.userId) {
      throw new Error('You need to login to see your recently added albums');
    }
    const searchedAlbums = await User.aggregate([
      { $match: { _id: Types.ObjectId(ctx.req.userId) } },
      { $unwind: '$albums' },
      { $project: { date: 0, email: 0, name: 0, password: 0, _id: 0, __v: 0 } },
      { $sort: { 'albums._id': -1 } },
      search
        ? {
            $match: {
              $or: [
                { 'albums.artist': { $regex: search, $options: 'i' } },
                { 'albums.title': { $regex: search, $options: 'i' } }
              ]
            }
          }
        : {
            $project: { date: 0 }
          },
      { $skip: skip },
      { $limit: limit },
      {
        $group: {
          _id: null,
          albums: { $push: '$albums' }
        }
      }
    ]);

    const albums = searchedAlbums[0].albums.map(album => {
      return {
        ...album,
        id: album._id.toString()
      };
    });
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

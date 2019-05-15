import 'dotenv/config';
import fetch from 'node-fetch';
import Album from '../../models/Album';
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
  albums: async (parent, { last = 10, search }, ctx, info) => {
    // if user is not logged in throw error
    if (!ctx.req.userId) {
      throw new Error('You need to login to see your recently added albums');
    }
    // get albums from db
    const dbAlbums = await User.findById(ctx.req.userId).select('albums');
    // get length of albums
    const { length } = dbAlbums.albums;
    const lastBiggerThanLength = last > length;
    const rest = length % 10;
    if (last - 10 > length) throw Error('no such page');
    // show last 10 albums
    const getAlbums = await User.findById(ctx.req.userId, {
      albums: { $slice: lastBiggerThanLength ? rest : [-last, 10] }
    });
    const lastAlbums = await getAlbums.albums;
    const lastTenAlbums = lastAlbums.reverse();

    const searchAlbums =
      search &&
      (await dbAlbums.albums.filter(album => {
        let { title, artist } = album;
        title = title.toLowerCase();
        artist = artist.toLowerCase();
        const find = search.toLowerCase();
        if (title.includes(find) || artist.includes(find)) {
          return album;
        }
      }));
    return searchAlbums ? searchAlbums : lastTenAlbums;
  },
  me: async (parent, args, ctx, info) => {
    if (!ctx.req.userId) {
      return null;
    }
    // get first ten album
    const firstTenAlbum = await User.aggregate([
      { $match: { _id: Types.ObjectId(ctx.req.userId) } },
      { $unwind: '$albums' },
      { $skip: 0 },
      { $limit: 10 },
      { $group: { _id: null, albums: { $push: '$albums' } } },
      { $project: { _id: 0 } }
    ]);
    // console.log(firstTenAlbum[0]);

    const searchedAlbums = await User.aggregate([
      { $match: { _id: Types.ObjectId(ctx.req.userId) } },
      { $unwind: '$albums' },
      { $project: { date: 0, email: 0, name: 0, password: 0, _id: 0, __v: 0 } },
      {
        $match: {
          $or: [
            { 'albums.artist': 'Black Sabbath' },
            { 'albums.title': 'Black Gives Way to Blue' }
          ]
        }
      },
      { $skip: 0 },
      { $limit: 20 },
      {
        $group: {
          _id: null,
          albums: { $push: '$albums' }
        }
      }
    ]);
    console.log(searchedAlbums);
    return User.findById(ctx.req.userId);
  }
};

export default Query;

// const getAlbums = await User.findById(ctx.req.userId, {
//     albums: {
//       $elemMatch: {
//         title: 'Undertow'
//       }

//     }
// }

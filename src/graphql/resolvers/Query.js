import 'dotenv/config';
import fetch from 'node-fetch';
import User from '../../models/User';

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

    const populatedUser = await user
      .populate({
        options: {
          sort: { _id: -1 },
        },
        path: 'albums',
        select: ['title', 'artist', 'image'],
        limit,
        skip,
        match: {
          $or: [
            {
              artist: {
                $regex: search,
                $options: 'i',
              },
            },
            {
              title: {
                $regex: search,
                $options: 'i',
              },
            },
          ],
        },
      })
      .execPopulate();

    return {
      total,
      albums: populatedUser.albums,
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

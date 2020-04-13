import fetch from 'node-fetch';
import Album from '../../models/Album';
import User from '../../models/User';
import albumBrowse from '../../utils/albumBrowse';
import albumSearch from '../../utils/albumSearch';

export default {
  Query: {
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
  },
  Mutation: {
    createAlbum: async (parent, { title, artist, image }, ctx, info) => {
      try {
        const user = await User.findById(ctx.req.userId);
        if (!user) throw Error('Sign in to add a cd');

        // check if album exists in db
        let album = await Album.findOne({
          title,
          artist,
          image,
        });

        // throw error if user has already created album
        if (album) {
          const hasAlbum = await User.findById(ctx.req.userId).where({
            'albums.album': { $eq: album.id },
          });
          if (hasAlbum) throw Error('You already have that album');
        }

        // if album not exist in db, create new one
        if (!album) {
          album = await Album.create({
            title,
            artist,
            image,
          }).catch((err) => {
            throw Error(err);
          });
        }

        // update that album by setting owners
        await album.updateOne({ $addToSet: { owners: user.id } });

        // update user by adding album to user's albums
        await user.updateOne({
          $push: {
            albums: {
              album: album.id,
              rating: 0,
            },
          },
        });

        return album;
      } catch (error) {
        throw Error(error);
      }
    },
    deleteAlbum: async (parent, { id }, ctx, info) => {
      try {
        const user = await User.findById(ctx.req.userId);
        await user.albums.remove(id);
        await user.save();
        return { message: 'succes' };
      } catch (error) {
        throw Error(error);
      }
    },
  },
};

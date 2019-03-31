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
  albumsCollection: async (parent, { search }, ctx, info) => {
    const user = await User.findById(ctx.req.userId);

    const albums = await user.albums.filter(album => {
      let { title, artist } = album;
      title = title.toLowerCase();
      artist = artist.toLowerCase();
      const find = search.toLowerCase();
      if (title.includes(find) || artist.includes(find)) {
        return album;
      }
    });
    return albums;
  },
  albumsLength: async (parent, args, ctx, info) => {
    const getAlbums = await User.findById(ctx.req.userId).select('albums');
    const { length } = getAlbums.albums;
    return length;
  },
  albums: async (parent, { last = 10 }, ctx, info) => {
    if (!ctx.req.userId) {
      throw new Error('You need to login to see your recently added albums');
    }
    const dbAlbums = await User.findById(ctx.req.userId).select('albums');
    const { length } = dbAlbums.albums;
    const lastBiggerThanLength = last > length;
    const rest = length % 10;
    if (last - 10 > length) throw Error('no such page');
    const getAlbums = await User.findById(ctx.req.userId, {
      albums: { $slice: lastBiggerThanLength ? rest : [-last, 10] }
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

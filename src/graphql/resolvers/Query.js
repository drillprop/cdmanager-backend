import fetch from 'node-fetch';
import bcrypt from 'bcryptjs';
import { apikey } from '../../../config';
import Album from '../../models/Album';
import User from '../../models/User';

const Query = {
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
        image: item.image[2]['#text']
      };
    });
    return albumQuery;
  },
  albums: async (parent, { search, last = 5 }, ctx, info) => {
    console.log(ctx.db);
    if (!search) {
      return Album.find({})
        .hint({ $natural: -1 })
        .limit(last);
    }
    return Album.find(
      { $text: { $search: search } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } });
  }
};

export default Query;

import fetch from 'node-fetch';
import bcrypt from 'bcryptjs';
import Album from '../../models/Album';
import User from '../../models/User';

const Mutation = {
  createCd: async (parent, args, ctx, info) => {
    let { title, artist, image } = args;
    const album = new Album({ title, artist, image });
    await album.save();
    return album;
  },
  createUser: async (parent, args, ctx, info) => {
    const { name, email, avatar } = args;
    const password = await bcrypt.hash(args.password, 10);
    const user = new User({ name, password, email, avatar });
    await user.save();
    return user;
  }
};

export default Mutation;

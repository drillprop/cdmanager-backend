import bcrypt from 'bcryptjs';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import Album from '../../models/Album';
import User from '../../models/User';

const Mutation = {
  createAlbum: async (parent, { title, artist, image }, ctx, info) => {
    const user = await User.findById(ctx.req.userId);
    if (!user) throw new Error('Sign in to add a cd');
    const double = await User.findById(ctx.req.userId).elemMatch('albums', {
      title,
      artist,
      image
    });
    if (double) throw new Error('You already have this album');
    const album = new Album({
      title,
      artist,
      image
    });
    await album.save();
    await user.albums.push(album);
    user.save();
    return album;
  },
  deleteAlbum: async (parent, { id }, ctx, info) => {
    const user = await User.findById(ctx.req.userId);
    await user.albums.id(id).remove();
    await user.save();
    return { message: 'succes' };
  },
  register: async (parent, args, ctx, info) => {
    const { name, email, avatar } = args;
    const password = await bcrypt.hash(args.password, 10);
    const user = await new User({ name, password, email, avatar });
    // check if user already exist
    const userExist = await User.findOne({ name });
    const emailExist = await User.findOne({ email });
    if (userExist || emailExist) throw new Error('User or email already exist');
    await user.save();
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // set cookie with token
    ctx.res.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
    return user;
  },
  login: async (parent, args, ctx, info) => {
    const { email, password } = args;
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Password or email is incorrect');
    }
    const correctPasword = await bcrypt.compare(password, user.password);
    if (!correctPasword) {
      throw new Error('Password or email is incorrect');
    }
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // set cookie with token
    ctx.res.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
    return user;
  },
  signout: (parent, args, ctx, info) => {
    ctx.res.clearCookie('token');
    return { message: 'succes' };
  }
};

export default Mutation;

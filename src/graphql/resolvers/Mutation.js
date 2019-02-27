import bcrypt from 'bcryptjs';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import Album from '../../models/Album';
import User from '../../models/User';

const Mutation = {
  createCd: async (parent, args, ctx, info) => {
    const user = await User.findById(ctx.req.userId);
    if (!user) {
      throw new Error('Sign in to add a cd');
    }
    let { title, artist, image } = args;
    console.log(user._id);
    const album = new Album({
      title,
      artist,
      image
    });
    await album.save();
    await user.albums.push(album);
    await user.save();

    return album;
  },
  signup: async (parent, args, ctx, info) => {
    const { name, email, avatar } = args;
    const password = await bcrypt.hash(args.password, 10);
    const user = new User({ name, password, email, avatar });
    await user.save();
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // set cookie with token
    ctx.res.cookie('token', token, {
      // httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
    return user;
  },
  signin: async (parent, args, ctx, info) => {
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
      // httpOnly: true,
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

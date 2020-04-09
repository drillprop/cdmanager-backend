import bcrypt from 'bcryptjs';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import Album from '../../models/Album';
import User from '../../models/User';

const Mutation = {
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
  register: async (parent, args, ctx, info) => {
    try {
      const { name, email, avatar } = args;
      const password = await bcrypt.hash(args.password, 10);
      const user = new User({ name, password, email, avatar });
      // check if user already exist
      const userExist = await User.findOne({ name });
      const emailExist = await User.findOne({ email });
      if (userExist || emailExist)
        throw new Error('User or email already exist');
      await user.save();
      const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
      // set cookie with token
      ctx.res.cookie('token', token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 365,
      });
      return user;
    } catch (error) {
      throw Error(error);
    }
  },
  login: async (parent, args, ctx, info) => {
    try {
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
        maxAge: 1000 * 60 * 60 * 24 * 365,
      });
      return user;
    } catch (error) {
      throw Error(error);
    }
  },
  signout: (parent, args, ctx, info) => {
    ctx.res.clearCookie('token');
    return { message: 'succes' };
  },
};

export default Mutation;

// check if user have that album
// const double = await User.findById(ctx.req.userId).elemMatch('albums', {
//   title,
//   artist,
//   image,
// });

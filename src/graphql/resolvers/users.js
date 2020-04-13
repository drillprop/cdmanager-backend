import bcrypt from 'bcryptjs';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import User from '../../models/User';

export default {
  Query: {
    me: async (parent, args, ctx, info) => {
      if (!ctx.req.userId) {
        return null;
      }
      return User.findById(ctx.req.userId);
    },
  },
  Mutation: {
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
  },
};

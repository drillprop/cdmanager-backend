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
        const { name, email } = args;

        // check if user already exist
        const emailExist = await User.findOne({ email });
        if (emailExist) throw Error('User with this email already exist');

        const password = await bcrypt.hash(args.password, 10);
        const user = new User({ name, password, email });
        await user.save();

        // set cookie with token
        const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
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
        if (!user) throw Error('Password or email is incorrect');

        const correctPasword = await bcrypt.compare(password, user.password);
        if (!correctPasword) throw Error('Password or email is incorrect');

        // set cookie with token
        const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
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
      return { message: 'success' };
    },
  },
};

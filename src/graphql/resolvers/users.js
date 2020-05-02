import { UserInputError } from 'apollo-server';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import User from '../../models/User';
import validateLoginInput from '../../utils/validateLoginInput';

export default {
  Query: {
    me: async (_parent, _args, ctx, _info) => {
      if (!ctx.req.userId) {
        return null;
      }
      return User.findById(ctx.req.userId);
    },
  },
  Mutation: {
    register: async (_parent, args, ctx, _info) => {
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
    login: async (_parent, args, ctx, _info) => {
      try {
        const { email, password } = args;
        const { valid, errors } = validateLoginInput(email, password);

        if (!valid) {
          throw new UserInputError('Errors', { errors });
        }

        const user = await User.findOne({ email });
        if (!user) {
          errors.general = 'User not found';
          throw new UserInputError('User not found', { errors });
        }

        const correctPasword = await bcrypt.compare(password, user.password);
        if (!correctPasword) {
          errors.general = 'Password is incorrect';
          throw new UserInputError('Password is incorrect', { errors });
        }

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
    signout: (_parent, _args, ctx, _info) => {
      ctx.res.clearCookie('token');
      return { message: 'success' };
    },
  },
};

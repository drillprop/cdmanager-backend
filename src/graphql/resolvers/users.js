import { UserInputError } from 'apollo-server';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import User from '../../models/User';
import setCookieWithToken from '../../utils/setCookieWithToken';
import validateLoginInput from '../../utils/validateLoginInput';
import validateRegisterInput from '../../utils/validateRegisterInput';

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
      const { name, email, password } = args;
      const { valid, errors } = validateRegisterInput(name, email, password);

      if (!valid) {
        throw new UserInputError('Errors', { errors });
      }

      // check if user already exist
      const emailExist = await User.findOne({ email });
      if (emailExist) {
        errors.email = 'User with this email already exist';
        throw new UserInputError('User with this email already exist', {
          errors,
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ name, email, password: hashedPassword });
      await user.save();

      const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
      setCookieWithToken(ctx.res, token);

      return user;
    },
    login: async (_parent, args, ctx, _info) => {
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

      const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
      setCookieWithToken(ctx.res, token);

      return user;
    },
    signout: (_parent, _args, ctx, _info) => {
      ctx.res.clearCookie('token', {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production' ? true : false,
      });
      return { message: 'success' };
    },
  },
};

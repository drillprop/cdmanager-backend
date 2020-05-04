import { AuthenticationError, ApolloError } from 'apollo-server';
import Album from '../../models/Album';
import User from '../../models/User';
import Rate from '../../models/Rate';

export default {
  Query: {},
  Mutation: {
    async rateAlbum(_parent, args, ctx, _info) {
      const { id, review = '', value = 0 } = args;
      const user = await User.findById(ctx.req.userId);
      if (!user)
        throw new AuthenticationError(
          'You need to login to see your recently added albums'
        );

      const album = await Album.findById(id);
      if (!album) throw new ApolloError(`Album doesn't exists`);

      let rate = await Rate.findOne({
        albumId: id,
        userId: ctx.req.userId,
      });

      if (rate) {
        const rateDiff = value - rate.value;

        await rate.updateOne({ review, value });

        await album.updateOne({
          $inc: { rateSum: rateDiff },
          rateAvg: (album.rateSum + rateDiff) / album.rateCount,
        });
      } else {
        rate = await Rate.create({
          albumId: id,
          userId: ctx.req.userId,
          review,
          value,
        });

        await album.updateOne({
          $inc: { rateSum: value, rateCount: 1 },
          rateAvg: (album.rateSum + value) / (album.rateCount + 1),
        });
      }

      const rateInAlbumExists = album.rates.find(
        (albumrate) => albumrate.toString() === rate.id
      );

      if (!rateInAlbumExists)
        await album.updateOne({
          $addToSet: { rates: rate.id },
        });

      return { message: 'success' };
    },
  },
};

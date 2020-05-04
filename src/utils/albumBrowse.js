import User from '../models/User';
import { Types } from 'mongoose';

export default async (id, skip, limit) => {
  const result = await User.aggregate([
    { $match: { _id: Types.ObjectId(id) } },
    { $unwind: { path: '$albums', includeArrayIndex: 'index' } },
    { $sort: { index: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: 'albums',
        localField: 'albums',
        foreignField: '_id',
        as: 'album',
      },
    },
    { $unwind: { path: '$album' } },
    {
      $project: {
        _id: 0,
        userId: '$_id',
        index: 1,
        id: '$album._id',
        artist: '$album.artist',
        title: '$album.title',
        image: '$album.image',
        rates: '$album.rates',
        rateSum: '$album.rateSum',
        rateAvg: '$album.rateAvg',
        rateCount: '$album.rateCount',
      },
    },
    {
      $lookup: {
        from: 'rates',
        localField: 'rates',
        foreignField: '_id',
        as: 'rates',
      },
    },
    {
      $addFields: {
        yourRate: {
          $arrayElemAt: [
            {
              $filter: {
                input: '$rates',
                as: 'rate',
                cond: { $eq: ['$$rate.userId', '$userId'] },
              },
            },
            0,
          ],
        },
      },
    },
  ]).exec();

  return result.map((album) => ({ ...album, id: album.id.toString() }));
};

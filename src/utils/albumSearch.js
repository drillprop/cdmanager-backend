import User from '../models/User';
import { Types } from 'mongoose';

export default async (id, search) => {
  const result = await User.aggregate([
    { $match: { _id: Types.ObjectId(id) } },
    { $unwind: { path: '$albums', includeArrayIndex: 'index' } },
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
        rateCount: { $size: '$album.rates' },
      },
    },
    {
      $match: {
        $or: [
          { artist: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } },
        ],
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
        rateAvg: { $avg: '$rates.value' },
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
  ]);

  return result.map((album) => ({ ...album, id: album.id.toString() }));
};

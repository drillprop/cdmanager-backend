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
        index: 1,
        title: '$album.title',
        artist: '$album.artist',
        image: '$album.image',
        id: '$album._id',
      },
    },
  ]).exec();

  return result.map((album) => ({ ...album, id: album.id.toString() }));
};

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
        index: 1,
        id: '$album._id',
        title: '$album.title',
        artist: '$album.artist',
        image: '$album.image',
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
  ]);
  return result.map((album) => ({ ...album, id: album.id.toString() }));
};

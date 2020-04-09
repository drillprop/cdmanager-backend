import User from '../models/User';
import { Types } from 'mongoose';

export default async (id, search) => {
  const result = await User.aggregate([
    { $match: { _id: Types.ObjectId(id) } },
    {
      $unwind: {
        path: '$albums',
      },
    },
    {
      $lookup: {
        from: 'albums',
        localField: 'albums.album',
        foreignField: '_id',
        as: 'album',
      },
    },
    {
      $unwind: {
        path: '$album',
      },
    },
    {
      $match: {
        $or: [
          {
            'album.artist': {
              $regex: search,
              $options: 'i',
            },
          },
          {
            'album.title': {
              $regex: search,
              $options: 'i',
            },
          },
        ],
      },
    },
    {
      $addFields: {
        id: '$albums._id',
        artist: '$album.artist',
        title: '$album.title',
        image: '$album.image',
        rate: '$albums.rating',
      },
    },
    {
      $project: {
        _id: 0,
        id: 1,
        artist: 1,
        title: 1,
        image: 1,
        rate: 1,
      },
    },
  ]).exec();

  return result.map((album) => ({
    ...album,
    id: album.id.toString(),
  }));
};

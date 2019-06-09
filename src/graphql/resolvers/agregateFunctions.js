import { Types } from 'mongoose';

export const reduceToObject = aggregateResult => {
  if (!aggregateResult.length) throw new Error('No albums found');
  console.log(aggregateResult);
  const albums = aggregateResult[0].albums.map(album => ({
    ...album,
    id: album._id.toString()
  }));
  const total = aggregateResult[0].total[0];
  return {
    albums,
    total
  };
};

export const albumSearch = (userId, search) => {
  return [
    { $match: { _id: Types.ObjectId(userId) } },
    { $unwind: '$albums' },
    { $sort: { 'albums._id': -1 } },
    {
      $match: {
        $or: [
          {
            'albums.artist': {
              $regex: search,
              $options: 'i'
            }
          },
          {
            'albums.title': {
              $regex: search,
              $options: 'i'
            }
          }
        ]
      }
    },
    {
      $group: {
        _id: null,
        albums: { $push: '$albums' }
      }
    },
    {
      $project: {
        albums: 1,
        albumsTotal: { $size: '$albums' }
      }
    },
    { $unwind: '$albums' },
    {
      $group: {
        _id: null,
        albums: { $push: '$albums' },
        total: { $addToSet: '$albumsTotal' }
      }
    }
  ];
};

export const albumBrowse = (userId, skip, limit) => {
  return [
    { $match: { _id: Types.ObjectId(userId) } },
    {
      $project: {
        albums: 1,
        albumsTotal: { $size: '$albums' }
      }
    },
    { $unwind: '$albums' },
    {
      $project: {
        date: 0,
        email: 0,
        name: 0,
        password: 0,
        _id: 0,
        __v: 0
      }
    },
    { $sort: { 'albums._id': -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $group: {
        _id: null,
        albums: { $push: '$albums' },
        total: { $addToSet: '$albumsTotal' }
      }
    }
  ];
};

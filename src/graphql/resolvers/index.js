import albums from './albums';
import users from './users';

export default {
  Query: {
    ...albums.Query,
    ...users.Query,
  },
  Mutation: {
    ...albums.Mutation,
    ...users.Mutation,
  },
};

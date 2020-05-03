import albums from './albums';
import users from './users';
import rates from './rates';

export default {
  Query: {
    ...albums.Query,
    ...rates.Query,
    ...users.Query,
  },
  Mutation: {
    ...albums.Mutation,
    ...rates.Mutation,
    ...users.Mutation,
  },
};

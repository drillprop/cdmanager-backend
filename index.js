const { ApolloServer, gql } = require('apollo-server');

const albums = [
  { artist: 'Black Sabbath', title: 'Paranoid', year: 1969, image: 'url' },
  { artist: 'Iron Maiden', title: 'Killers', year: 1972, image: 'url' },
  { artist: 'Led Zeppelin', title: 'IV', year: 1972, image: 'url' },
  { artist: 'Cream', title: 'Disraeli Gears', year: 1968, image: 'url' },
  {
    artist: 'Arthur Brown',
    title: 'Crazy World of the Arthur Brown',
    year: 1969,
    image: 'url'
  }
];

const typeDefs = gql`
  type Query {
    albums: [Album]
  }
  type Album {
    title: String!
    artist: String!
    year: Int
    image: String
  }
`;

const resolvers = {
  Query: {
    albums: () => albums
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen().then(({ url }) => {
  console.log(`server ready at ${url}`);
});

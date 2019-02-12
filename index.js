const { ApolloServer, gql } = require('apollo-server');
const { apikey } = require('./config.js');
const fetch = require('node-fetch');

const typeDefs = gql`
  type Query {
    albums(search: String!): [Album]
  }
  type Album {
    title: String!
    artist: String!
    image: String
  }
`;

const resolvers = {
  Query: {
    albums: async (parent, args, ctx, info) => {
      let { search } = args;
      let baseUrl = `http://ws.audioscrobbler.com/2.0/?method=album.search&album=${search}&api_key=${apikey}&format=json`;
      let res = await fetch(baseUrl);
      let json = await res.json();
      let album = await json.results.albummatches.album;
      let albumQuery = album.map(item => {
        return {
          title: item.name,
          artist: item.artist,
          image: item.image[3]['#text']
        };
      });
      return albumQuery;
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen().then(({ url }) => {
  console.log(`server ready at ${url}`);
});

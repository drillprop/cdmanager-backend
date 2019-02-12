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
    albums: (parent, args, ctx, info) => {
      let smth = args.search;
      let baseUrl = `http://ws.audioscrobbler.com/2.0/?method=album.search&album=${smth}&api_key=${apikey}&format=json`;
      return fetch(baseUrl)
        .then(res => res.json())
        .then(json => json.results.albummatches.album)
        .then(album => {
          return album.map(item => {
            return {
              title: item.name,
              artist: item.artist,
              image: item.image[3]['#text']
            };
          });
        });
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

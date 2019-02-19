const { ApolloServer, gql } = require('apollo-server');
const { apikey } = require('./config.js');
const fetch = require('node-fetch');
const Album = require('./src/db');

const typeDefs = gql`
  type Query {
    albumslastfm(search: String!): [Album]
    albums(search: String!): [Album]
  }
  type Mutation {
    createCd(title: String!, artist: String!, image: String, id: String): Album
  }
  type Album {
    title: String!
    artist: String!
    image: String
    id: String
  }
`;

const resolvers = {
  Query: {
    albumslastfm: async (parent, args, ctx, info) => {
      const { search } = args;
      let baseUrl = `http://ws.audioscrobbler.com/2.0/?method=album.search&album=${search}&api_key=${apikey}&format=json`;
      const res = await fetch(baseUrl);
      const json = await res.json();
      const album = await json.results.albummatches.album;
      const albumQuery = album.map(item => {
        return {
          title: item.name,
          artist: item.artist,
          image: item.image[2]['#text'],
          id: item.mbid
        };
      });
      return albumQuery;
    },
    albums: async (parent, args, ctx, info) => {
      const { search } = args;
      const lowerSearch = search.toLowerCase();
      if (global.albums) {
        return global.albums.filter(album => {
          const { title, artist } = album;
          if (title.includes(lowerSearch) || artist.includes(lowerSearch)) {
            return album;
          }
        });
      }
    }
  },
  Mutation: {
    createCd: async (parent, args, ctx, info) => {
      let { title, artist, image, id } = args;
      const album = new Album({ title, artist, image });
      await album.save();
      return album;
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

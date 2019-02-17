const { ApolloServer, gql } = require('apollo-server');
const { apikey } = require('./config.js');
const fetch = require('node-fetch');

const typeDefs = gql`
  type Query {
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
          image: item.image[2]['#text'],
          id: item.mbid
        };
      });
      return albumQuery;
    }
  },
  Mutation: {
    createCd: async (parent, args, ctx, info) => {
      let { title, artist, image, id } = args;
      global.albums = global.albums || [];
      let album = {
        title,
        artist,
        image,
        id
      };
      global.albums.push(album);
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

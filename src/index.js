import { ApolloServer, gql } from 'apollo-server-express';
import express from 'express';
import { apikey } from '../config.js';
import fetch from 'node-fetch';
import { db } from './db';
import Album from './models/Album';
import User from './models/User';

const typeDefs = gql`
  type Query {
    albumslastfm(search: String!): [Album]
    albums(search: String, last: Int): [Album]
  }
  type Mutation {
    createUser(
      name: String!
      email: String!
      password: String!
      avatar: String
    ): User
    createCd(title: String!, artist: String!, image: String, id: String): Album
  }
  type User {
    name: String!
    email: String!
    password: String!
    avatar: String
    id: String!
    albums: [Album]
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
          image: item.image[2]['#text']
        };
      });
      return albumQuery;
    },
    albums: async (parent, { search, last = 5 }, ctx, info) => {
      console.log(ctx.db);
      if (!search) {
        return Album.find({})
          .hint({ $natural: -1 })
          .limit(last);
      }
      return Album.find(
        { $text: { $search: search } },
        { score: { $meta: 'textScore' } }
      ).sort({ score: { $meta: 'textScore' } });
    }
  },
  Mutation: {
    createCd: async (parent, args, ctx, info) => {
      let { title, artist, image } = args;
      const album = new Album({ title, artist, image });
      await album.save();
      return album;
    },
    createUser: async (parent, args, ctx, info) => {
      const { name, password, email, avatar } = args;
      const user = new User({ name, password, email, avatar });
      await user.save();
      return user;
    }
  }
};

const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: req => ({ ...req, db })
});
server.applyMiddleware({ app, path: '/' });

app.listen({ port: 4000 }, () => {
  console.log(`server ready at ${server.graphqlPath}`);
});
